"""
app/observability/eval_runner.py

Orchestrates all four evaluators for a single chat turn,
writes scores to Postgres, and pushes them to Langfuse.
Called as a FastAPI background task — never blocks the response.
"""
from __future__ import annotations

import logging
import time
from typing import Any

from app.observability.evaluators import (
    evaluate_context_relevance,
    evaluate_escalation_accuracy,
    evaluate_groundedness,
    evaluate_latency,
    evaluate_response_quality,
    evaluate_tool_accuracy,
)
from app.observability.db import save_eval_result
from app.observability.tracing import score_trace
from dataclasses import dataclass, field
from typing import Callable, Awaitable
from app.config import settings

logger = logging.getLogger(__name__)


@dataclass
class AgentEvalConfig:
    agent_name: str
    agent_version: str
    model_name: str

    # Optional custom evaluators — each returns (score, note)
    # If not provided, falls back to the generic ones
    tool_accuracy_fn:       Callable | None = None
    escalation_accuracy_fn: Callable | None = None

    # Which tools count as retrieval (for context relevance eval)
    retrieval_tools: list[str] = field(default_factory=lambda: [
        "search_products", "search_faqs", "search_policies"
    ])

    # Which tools are expected for which intent patterns
    # list of (compiled regex, expected tool name)
    tool_expectations: list[tuple] = field(default_factory=list)

    # Patterns that indicate a routine (non-escalation) message
    routine_patterns: str = ""

    # Patterns that indicate high-risk (should escalate)
    high_risk_patterns: str = ""


async def run_eval_pipeline(
    *,
    session_id: str,
    customer_id: int | None,
    langfuse_trace_id: str | None,
    user_message: str,
    agent_reply: str,
    escalated: bool,
    sources: list[str],
    tools_called: list[dict],   # list of {name, args, result_preview}
    latency_ms: float,
    prompt_tokens: int,
    completion_tokens: int,
    llm: Any,
    config: AgentEvalConfig,          # <-- replaces agent_name/version/model_name args
    error: str | None = None,
    stacktrace: str | None = None,
) -> None:
    """
    Run all evaluators, persist to Postgres, push scores to Langfuse.
    Safe to call in a background task — never raises.
    """
    try:
        # ── 1. Response quality (LLM judge) ──────────────────────────────────
        rq_score, rq_note = await evaluate_response_quality(
            user_message, agent_reply, llm, tools_called
        )

        # ── 2. Tool accuracy (rule-based) ─────────────────────────────────────
        if config.tool_accuracy_fn:
            ta_score, ta_note = await config.tool_accuracy_fn(
                user_message, tools_called, agent_reply
            )
        else:
            ta_score, ta_note = await evaluate_tool_accuracy(
                user_message, tools_called, agent_reply,
                tool_expectations=config.tool_expectations,
            )

        # ── 3. Escalation accuracy ────────────────────────────────────────────
        if config.escalation_accuracy_fn:
            ea_score, ea_note = await config.escalation_accuracy_fn(
                user_message, agent_reply, escalated, tools_called
            )
        else:
            ea_score, ea_note = await evaluate_escalation_accuracy(
                user_message, agent_reply, escalated, tools_called,
                routine_patterns=config.routine_patterns,
                high_risk_patterns=config.high_risk_patterns,
            )

        # ── 4. Latency ────────────────────────────────────────────────────────
        lat_score, lat_note = evaluate_latency(latency_ms)
        gr_score,  gr_note  = await evaluate_groundedness(agent_reply, tools_called, llm)
        cr_score,  cr_note  = await evaluate_context_relevance(
            user_message, tools_called, llm,
            retrieval_tools=config.retrieval_tools,
        )

        scores = {
            "response_quality":    rq_score,
            "tool_accuracy":       ta_score,
            "escalation_accuracy": ea_score,
            "latency":             lat_score,
            "groundedness":        gr_score,
            "context_relevance":   cr_score,
        }
        notes = {
            "response_quality":    rq_note,
            "tool_accuracy":       ta_note,
            "escalation_accuracy": ea_note,
            "latency":             lat_note,
            "groundedness":        gr_note,
            "context_relevance":   cr_note,
        }

        logger.info(
            f"[Eval] session={session_id} "
            f"quality={rq_score:.2f} tool={ta_score:.2f} "
            f"escalation={ea_score:.2f} latency={lat_score:.2f}"
        )

        # ── Push scores to Langfuse ───────────────────────────────────────────
        # score_trace reads the ContextVar — still valid in background tasks
        # spawned in the same async context.
        for name, value in scores.items():
            if value is not None:
                score_trace(name=name, value=value, comment=notes[name])

        await save_eval_result(
            session_id=session_id,
            customer_id=customer_id,
            langfuse_trace_id=langfuse_trace_id,
            agent_name=config.agent_name,
            agent_version=config.agent_version,
            model_name=config.model_name,
            user_message=user_message,
            agent_reply=agent_reply,
            escalated=escalated,
            sources=sources,
            tools_called=tools_called,
            latency_ms=latency_ms,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            scores=scores,
            eval_notes=notes,
            error=error,
            stacktrace=stacktrace,
        )

    except Exception as exc:
        logger.error(f"[Eval] Pipeline error for session {session_id}: {exc}", exc_info=True)