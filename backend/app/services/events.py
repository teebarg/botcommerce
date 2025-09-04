from typing import Any, Dict, Optional

from app.services.redis import CacheService
from app.models.user import User
from app.core.deps import RedisClient
from app.core.logging import get_logger

logger = get_logger(__name__)


async def publish_user_registered(
    cache: CacheService,
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
        payload["created_at"] = created_at

    await cache.publish_event("USER_REGISTERED", payload)


async def publish_event(cache: RedisClient, event: dict):
    try:
        await cache.xadd("EVENT_STREAMS", event)
    except Exception as e:
        logger.error(f"Failed to publish event to EVENT_STREAMS: {str(e)}")


async def publish_order_event(cache: RedisClient, order: dict, type: str):
    event = {
        "type": type,
        "order_id": order.id,
        "order_number": order.order_number,
        "user_id": order.user_id,
        "email": order.email if order.email else "",
        "status": order.status,
    }
    try:
        await cache.xadd("EVENT_STREAMS", event)
    except Exception as e:
        logger.error(f"Failed to publish event to EVENT_STREAMS: {str(e)}")

