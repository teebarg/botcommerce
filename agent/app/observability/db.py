"""
app/observability/db.py

Postgres schema + async helpers for storing eval results.
Uses the same DB connection pattern already in app/agent/db.py.
"""
from __future__ import annotations

import json
import logging
from datetime import datetime, timezone

from app.agent.db import get_connection

logger = logging.getLogger(__name__)


async def save_eval_result(
    session_id: str,
    customer_id: int | None,
    langfuse_trace_id: str | None,
    user_message: str,
    agent_reply: str,
    escalated: bool,
    sources: list[str],
    tools_called: list[dict],
    latency_ms: float,
    prompt_tokens: int,
    completion_tokens: int,
    scores: dict[str, float | None],
    eval_notes: dict[str, str],
    agent_name: str = "",
    agent_version: str = "",
    model_name: str = "",
    error: str | None = None,
    stacktrace: str | None = None,
) -> None:
    """Insert one eval row."""
    try:
        conn = await get_connection()
        await conn.execute(
            """
            INSERT INTO eval_results (
                session_id, customer_id, langfuse_trace_id,
                agent_name, agent_version, model_name,
                user_message, agent_reply, escalated, sources, tools_called,
                latency_ms, prompt_tokens, completion_tokens, total_tokens,
                score_response_quality, score_tool_accuracy,
                score_escalation_accuracy, score_latency,
                score_groundedness, score_context_relevance,
                eval_notes, error, stacktrace
            ) VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
                $12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24
            )
            """,
            session_id, customer_id, langfuse_trace_id,
            agent_name, agent_version, model_name,
            user_message, agent_reply, escalated,
            json.dumps(sources), json.dumps(tools_called),
            latency_ms, prompt_tokens, completion_tokens,
            prompt_tokens + completion_tokens,
            scores.get("response_quality"),
            scores.get("tool_accuracy"),
            scores.get("escalation_accuracy"),
            scores.get("latency"),
            scores.get("groundedness"),        # new
            scores.get("context_relevance"),   # new
            json.dumps(eval_notes),
            error,
            stacktrace,
        )
        logger.info(f"[EvalDB] Saved eval for session {session_id}")
    except Exception as exc:
        logger.error(f"[EvalDB] save_eval_result error: {exc}")
    finally:
        if conn:
            await conn.close()


async def get_eval_summary(limit: int = 100) -> list[dict]:
    """Return latest N eval rows as dicts — useful for dashboards."""
    try:
        conn = await get_connection()
        rows = await conn.fetch(
            """
            SELECT
                session_id, created_at, latency_ms,
                score_response_quality, score_tool_accuracy,
                score_escalation_accuracy, score_latency,
                escalated, sources
            FROM eval_results
            ORDER BY created_at DESC
            LIMIT $1
            """,
            limit,
        )
        return [dict(r) for r in rows]
    except Exception as exc:
        logger.error(f"[EvalDB] get_eval_summary error: {exc}")
        return []
    finally:
        if conn:
            await conn.close()