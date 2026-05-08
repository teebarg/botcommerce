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
    evaluate_escalation_accuracy,
    evaluate_latency,
    evaluate_response_quality,
    evaluate_tool_accuracy,
)
from app.observability.db import save_eval_result
from app.observability.tracing import score_trace

logger = logging.getLogger(__name__)


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
) -> None:
    """
    Run all evaluators, persist to Postgres, push scores to Langfuse.
    Safe to call in a background task — never raises.
    """
    try:
        # ── 1. Response quality (LLM judge) ──────────────────────────────────
        rq_score, rq_note = await evaluate_response_quality(
            user_message, agent_reply, llm
        )

        # ── 2. Tool accuracy (rule-based) ─────────────────────────────────────
        ta_score, ta_note = await evaluate_tool_accuracy(
            user_message, tools_called, agent_reply
        )

        # ── 3. Escalation accuracy ────────────────────────────────────────────
        ea_score, ea_note = await evaluate_escalation_accuracy(
            user_message, agent_reply, escalated, tools_called
        )

        # ── 4. Latency ────────────────────────────────────────────────────────
        lat_score, lat_note = evaluate_latency(latency_ms)

        scores = {
            "response_quality":    rq_score,
            "tool_accuracy":       ta_score,
            "escalation_accuracy": ea_score,
            "latency":             lat_score,
        }
        notes = {
            "response_quality":    rq_note,
            "tool_accuracy":       ta_note,
            "escalation_accuracy": ea_note,
            "latency":             lat_note,
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

        # ── Persist to Postgres ───────────────────────────────────────────────
        await save_eval_result(
            session_id=session_id,
            customer_id=customer_id,
            langfuse_trace_id=langfuse_trace_id,
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
        )

    except Exception as exc:
        logger.error(f"[Eval] Pipeline error for session {session_id}: {exc}", exc_info=True)