"""
app/observability/db.py

Postgres schema + async helpers for storing eval results.
Uses the same DB connection pattern already in app/agent/db.py.
"""
from __future__ import annotations

import json
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

# ── DDL — run once on startup ─────────────────────────────────────────────────

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS eval_results (
    id              BIGSERIAL PRIMARY KEY,
    session_id      TEXT        NOT NULL,
    customer_id     INTEGER,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    langfuse_trace_id TEXT,

    -- Input / output snapshot
    user_message    TEXT,
    agent_reply     TEXT,
    escalated       BOOLEAN     DEFAULT FALSE,
    sources         JSONB,      -- list[str]
    tools_called    JSONB,      -- list[{name, args, result_preview}]

    -- Performance
    latency_ms      FLOAT,
    prompt_tokens   INTEGER,
    completion_tokens INTEGER,
    total_tokens    INTEGER,

    -- Eval scores  (0.0 – 1.0)
    score_response_quality  FLOAT,   -- LLM judge: correctness + tone
    score_tool_accuracy     FLOAT,   -- right tool, right args
    score_escalation_accuracy FLOAT, -- was escalation decision correct
    score_latency           FLOAT,   -- normalized inverse-latency score

    -- Qualitative notes from judges
    eval_notes      JSONB        -- {dimension: "...reasoning..."}
);

CREATE INDEX IF NOT EXISTS idx_eval_session  ON eval_results(session_id);
CREATE INDEX IF NOT EXISTS idx_eval_created  ON eval_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_eval_customer ON eval_results(customer_id);
"""


async def ensure_eval_table() -> None:
    """Create the eval_results table if it doesn't exist. Call on startup."""
    try:
        from app.agent.db import _get_pool  # reuse existing pool helper
        pool = await _get_pool()
        async with pool.acquire() as conn:
            await conn.execute(CREATE_TABLE_SQL)
        logger.info("[EvalDB] eval_results table ready")
    except Exception as exc:
        logger.error(f"[EvalDB] Could not create table: {exc}")


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
) -> None:
    """Insert one eval row. Never raises — failures are logged only."""
    try:
        from app.agent.db import _get_pool
        pool = await _get_pool()
        async with pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO eval_results (
                    session_id, customer_id, langfuse_trace_id,
                    user_message, agent_reply, escalated, sources, tools_called,
                    latency_ms, prompt_tokens, completion_tokens, total_tokens,
                    score_response_quality, score_tool_accuracy,
                    score_escalation_accuracy, score_latency,
                    eval_notes
                ) VALUES (
                    $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
                )
                """,
                session_id,
                customer_id,
                langfuse_trace_id,
                user_message,
                agent_reply,
                escalated,
                json.dumps(sources),
                json.dumps(tools_called),
                latency_ms,
                prompt_tokens,
                completion_tokens,
                prompt_tokens + completion_tokens,
                scores.get("response_quality"),
                scores.get("tool_accuracy"),
                scores.get("escalation_accuracy"),
                scores.get("latency"),
                json.dumps(eval_notes),
            )
        logger.info(f"[EvalDB] Saved eval for session {session_id}")
    except Exception as exc:
        logger.error(f"[EvalDB] save_eval_result error: {exc}")


async def get_eval_summary(limit: int = 100) -> list[dict]:
    """Return latest N eval rows as dicts — useful for dashboards."""
    try:
        from app.agent.db import _get_pool
        pool = await _get_pool()
        async with pool.acquire() as conn:
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