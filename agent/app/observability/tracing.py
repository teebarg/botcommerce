"""
app/observability/tracing.py

Context-var based tracing helpers.
The active trace for the current async task is stored in a ContextVar so
agent_graph.py can attach spans without passing objects through the call stack.
"""
from __future__ import annotations

import time
import logging
from contextvars import ContextVar
from typing import Any

from app.observability.langfuse_client import create_trace, get_langfuse

logger = logging.getLogger(__name__)

# One trace per async task (one per chat turn)
_active_trace: ContextVar[Any] = ContextVar("_active_trace", default=None)
_active_turn_span: ContextVar[Any] = ContextVar("_active_turn_span", default=None)


def get_trace() -> Any:
    return _active_trace.get()


def get_turn_span() -> Any:
    return _active_turn_span.get()


def start_turn_trace(
    session_id: str,
    customer_id: int | None,
    message: str,
) -> tuple[Any, Any]:
    """
    Open a Langfuse trace + a top-level 'turn' span.
    Returns (trace, span). Store them; call end_turn_trace() when done.
    """
    trace = create_trace(
        name="chat_turn",
        session_id=session_id,
        user_id=customer_id,
        tags=["production"],
        input={"message": message},
        metadata={"session_id": session_id},
    )
    span = trace.span(
        name="turn",
        input={"message": message},
        metadata={"session_id": session_id, "customer_id": customer_id},
    )
    _active_trace.set(trace)
    _active_turn_span.set(span)
    return trace, span


def end_turn_trace(
    span: Any,
    trace: Any,
    reply: str,
    escalated: bool,
    sources: list[str],
    latency_ms: float,
    token_usage: dict | None = None,
) -> None:
    """Close the turn span and update the trace with final output."""
    try:
        span.end(
            output={"reply": reply, "escalated": escalated, "sources": sources},
            metadata={
                "latency_ms": round(latency_ms, 1),
                **(token_usage or {}),
            },
        )
        trace.update(
            output={"reply": reply, "escalated": escalated},
            metadata={
                "latency_ms": round(latency_ms, 1),
                **(token_usage or {}),
            },
        )
    except Exception as exc:
        logger.debug(f"[Tracing] end_turn_trace error: {exc}")


def record_llm_generation(
    model: str,
    prompt_tokens: int,
    completion_tokens: int,
    latency_ms: float,
    input_messages: list,
    output_text: str,
    iteration: int,
) -> None:
    """Record a single LLM call as a Langfuse generation."""
    trace = get_trace()
    if not trace:
        return
    try:
        trace.generation(
            name=f"llm_call_iter_{iteration}",
            model=model,
            usage={
                "input": prompt_tokens,
                "output": completion_tokens,
                "total": prompt_tokens + completion_tokens,
                "unit": "TOKENS",
            },
            input=input_messages,
            output=output_text,
            metadata={"latency_ms": round(latency_ms, 1)},
        )
    except Exception as exc:
        logger.debug(f"[Tracing] record_llm_generation error: {exc}")


def record_tool_span(
    tool_name: str,
    tool_args: dict,
    tool_result: str,
    latency_ms: float,
) -> None:
    """Record a single tool call as a child span of the active trace."""
    trace = get_trace()
    if not trace:
        return
    try:
        span = trace.span(
            name=f"tool:{tool_name}",
            input=tool_args,
            metadata={"latency_ms": round(latency_ms, 1)},
        )
        span.end(output={"result": tool_result[:500]})
    except Exception as exc:
        logger.debug(f"[Tracing] record_tool_span error: {exc}")


def score_trace(name: str, value: float, comment: str = "") -> None:
    """Attach a numeric score (0-1) to the active trace."""
    trace = get_trace()
    if not trace:
        return
    try:
        trace.score(name=name, value=value, comment=comment)
    except Exception as exc:
        logger.debug(f"[Tracing] score_trace error: {exc}")