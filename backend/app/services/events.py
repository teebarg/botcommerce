from typing import Any, Dict, Optional

from app.models.user import User
from app.core.logging import get_logger
from app.redis_client import redis_client

logger = get_logger(__name__)

async def publish_user_registered(
    *,
    user: User,
    source: str,
    created_at: Optional[Any] = None,
) -> None:
    payload: Dict[str, Any] = {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "status": user.status,
        "role": user.role,
        "source": source,
    }
    if created_at is not None:
        payload["created_at"] = created_at.isoformat()

    await redis_client.xadd("USER_REGISTERED", payload)


async def publish_event(event: dict):
    try:
        await redis_client.xadd("EVENT_STREAMS", event)
    except Exception as e:
        logger.error(f"Failed to publish event to EVENT_STREAMS: {str(e)}")


async def publish_order_event(order: dict, type: str):
    event = {
        "type": type,
        "order_id": order.id,
        "cart_id": order.cart_id,
        "order_number": order.order_number,
        "user_id": order.user_id,
        "email": order.email if order.email else "",
        "status": order.status,
    }
    try:
        await redis_client.xadd("EVENT_STREAMS", event)
    except Exception as e:
        logger.error(f"Failed to publish event to EVENT_STREAMS: {str(e)}")
