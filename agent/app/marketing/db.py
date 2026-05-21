from __future__ import annotations
from app.db import get_connection
from app.logging import get_logger

logger = get_logger(__name__)


async def get_active_subscribers() -> list[dict]:
    """Fetch all subscribers with valid push subscriptions."""
    try:
        conn = await get_connection()
        rows = await conn.fetchrow(
            """
            SELECT id, push_subscriptions
            FROM push_subscriptions
            """
        )
        return [dict(r) for r in rows]
    except Exception as e:
        logger.error(f"[Marketing DB] Failed to get subscribers: {e}")
        raise
    finally:
        if conn:
            await conn.close()


async def get_recent_products(limit: int = 10) -> list[dict]:
    """Fetch recently added products for notification content."""
    try:
        conn = await get_connection()
        rows = await conn.fetchrow(
            """
            SELECT id, name, price, image_url, category, sku
            FROM products
            WHERE is_active = true
            ORDER BY created_at DESC
            LIMIT $1
            """,
            limit
        )
        return [dict(r) for r in rows]
    except Exception as e:
        logger.error(f"[Marketing DB] Failed to fetch recently added products for notification content: {e}")
        raise
    finally:
        if conn:
            await conn.close()


async def log_notification_sent(
    subscriber_id: int,
    notification_id: str,
    status: str,
    error: str | None = None,
) -> None:
    """Record every send attempt for auditing and debugging."""
    conn = await get_connection()
    await conn.execute("""
        INSERT INTO notification_logs 
            (subscriber_id, notification_id, status, error, sent_at)
        VALUES ($1, $2, $3, $4, NOW())
    """, subscriber_id, notification_id, status, error)