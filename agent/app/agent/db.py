import json
import logging
import asyncpg
from typing import Optional
from datetime import datetime
from app.config import get_settings

settings = get_settings()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────
# Connection Helper
# ─────────────────────────────────────────────────────────────

async def get_connection() -> asyncpg.Connection:
    url: str | None = settings.DATABASE_URL
    if not url:
        raise RuntimeError("DATABASE_URL is not set in .env")

    return await asyncpg.connect(url)

async def ensure_conversation_exists(
    session_id: str,
    customer_id: Optional[str] = None,
) -> int:
    """
    Ensures a row exists.
    Returns conversation.id
    """
    conn = await get_connection()
    try:
        row = await conn.fetchrow(
            """
            SELECT id
            FROM conversations
            WHERE conversation_uuid = $1
            """,
            session_id,
        )

        if row:
            return row["id"]

        logger.info(f"[DB] Creating new conversation {session_id}")

        row = await conn.fetchrow(
            """
            INSERT INTO conversations (
                conversation_uuid,
                user_id,
                last_active
            )
            VALUES ($1, $2, NOW())
            RETURNING id
            """,
            session_id,
            customer_id,
        )

        return row["id"]

    finally:
        await conn.close()


# ─────────────────────────────────────────────────────────────
# Human Handoff Check
# ─────────────────────────────────────────────────────────────

async def is_human_connected(session_id: str) -> bool:
    """
    Returns True if human_connected is True
    """
    conn = await get_connection()
    try:
        row = await conn.fetchrow(
            """
            SELECT human_connected
            FROM conversations
            WHERE conversation_uuid = $1
            """,
            session_id,
        )

        if not row:
            return False

        return row["human_connected"]

    finally:
        await conn.close()


# ─────────────────────────────────────────────────────────────
# Escalation
# ─────────────────────────────────────────────────────────────

async def mark_escalated(session_id: str):
    conn = await get_connection()
    try:
        await conn.execute(
            """
            UPDATE conversations
            SET status = 'ESCALATED',
                escalated_at = NOW()
            WHERE conversation_uuid = $1
            """,
            session_id,
        )
        logger.info(f"[DB] Conversation {session_id} escalated")

    finally:
        await conn.close()


async def mark_human_active(session_id: str):
    conn = await get_connection()
    try:
        await conn.execute(
            """
            UPDATE conversations
            SET status = 'HUMAN_ACTIVE'
            WHERE conversation_uuid = $1
            """,
            session_id,
        )
        logger.info(f"[DB] Human connected to {session_id}")

    finally:
        await conn.close()


# ─────────────────────────────────────────────────────────────
# Message Persistence
# ─────────────────────────────────────────────────────────────

async def save_message_db2(
    session_id: str,
    role: str,
    content: str,
    metadata: Optional[dict] = None,
):
    """
    Persists a message to the database.
    """

    conn = await get_connection()
    try:
        conversation_row = await conn.fetchrow(
            """
            SELECT id
            FROM conversations
            WHERE conversation_uuid = $1
            """,
            session_id,
        )

        if not conversation_row:
            raise RuntimeError(
                f"Conversation {session_id} does not exist. "
                "Call ensure_conversation_exists first."
            )

        conversation_id = conversation_row["id"]

        await conn.execute(
            """
            INSERT INTO message (
                conversation_id,
                role,
                content,
                metadata,
                created_at
            )
            VALUES ($1, $2, $3, $4, NOW())
            """,
            conversation_id,
            role,
            content,
            metadata,
        )

    finally:
        await conn.close()

async def save_message_db(
    session_id: str,
    role: str,
    content: str,
    metadata: dict = None,
):
    """
    Saves a message. If the conversation doesn't exist yet, it creates it automatically.
    """
    conn = await get_connection()
    try:
        conversation = await conn.fetchrow(
            """
            INSERT INTO conversations (conversation_uuid, started_at, last_active, status)
            VALUES ($1, NOW(), NOW(), 'ACTIVE')
            ON CONFLICT (conversation_uuid) 
            DO UPDATE SET status = 'ACTIVE' -- Just to ensure we get the row back
            RETURNING id
            """,
            session_id
        )
        
        conversation_id = conversation["id"]

        await conn.execute(
            """
            INSERT INTO messages (
                conversation_id,
                sender,
                content,
                metadata,
                timestamp
            )
            VALUES ($1, $2, $3, $4, NOW())
            """,
            conversation_id,
            role,
            content,
            json.dumps(metadata) if metadata else None
        )

    except Exception as e:
        logger.error(f"❌ DB Error in save_message_db: {e}")
    finally:
        await conn.close()
