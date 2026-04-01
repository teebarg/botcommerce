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
async def mark_escalated(conversation_uuid: str):
    conn = None
    try:
        conn = await get_connection()
        await conn.execute(
            """
            INSERT INTO conversations (conversation_uuid, is_escalated, last_active)
            VALUES ($1, true, NOW())
            ON CONFLICT (conversation_uuid)
            DO UPDATE SET
                is_escalated = true,
                last_active = NOW()
            """,
            conversation_uuid,
        )
        logger.info(f"[DB] Conversation {conversation_uuid} escalated")

    except Exception:
        logger.exception(f"[DB] Failed to escalate conversation uuid={conversation_uuid}")
        raise

    finally:
        if conn:
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


async def update_conversation_db(
    session_id: str,
    *,
    is_escalated: Optional[bool] = None,
) -> None:
    """
    Updates a conversation by session_id.

    - Allows updating is_escalated
    - Automatically updates last_active
    - Creates conversation if it doesn't exist (optional behavior)
    """
    conn = await get_connection()
    try:
        conversation = await conn.fetchrow(
            """
            INSERT INTO conversations (conversation_uuid, started_at, last_active, status)
            VALUES ($1, NOW(), NOW(), 'ACTIVE')
            ON CONFLICT (conversation_uuid)
            DO UPDATE SET last_active = NOW()
            RETURNING id
            """,
            session_id
        )

        conversation_id = conversation["id"]

        # Build dynamic update (future-proof if you add more fields)
        updates = []
        values = []
        idx = 1

        if is_escalated is not None:
            updates.append(f"is_escalated = ${idx}")
            values.append(is_escalated)
            idx += 1

        # Always update last_active
        updates.append(f"last_active = NOW()")

        if updates:
            query = f"""
                UPDATE conversations
                SET {', '.join(updates)}
                WHERE id = ${idx}
            """
            values.append(conversation_id)

            await conn.execute(query, *values)

    except Exception as e:
        logger.error(f"❌ DB Error in update_conversation_db: {e}")
    finally:
        await conn.close()
