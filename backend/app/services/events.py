from typing import Any, Dict, Optional
from app.core.logging import get_logger

logger = get_logger(__name__)


class EventBus:
    STREAM_NAME = "EVENT_STREAMS"

    def __init__(self, redis):
        self.redis = redis

    async def publish(self, event: Dict[str, Any]) -> None:
        try:
            await self.redis.xadd(self.STREAM_NAME, event)
        except Exception as e:
            logger.error(f"Failed to publish event: {e}", exc_info=True)

    async def publish_user_registered(self, user, source: str, created_at: Optional[Any] = None):
        payload = {
            "type": "USER_REGISTERED",
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "status": user.status,
            "role": user.role,
            "source": source,
        }

        if created_at:
            payload["created_at"] = created_at.isoformat()

        await self.publish(payload)

    async def publish_order_event(self, order, event_type: str):
        payload = {
            "type": event_type,
            "order_id": order.id,
            "cart_id": order.cart_id,
            "order_number": order.order_number,
            "user_id": order.user_id,
            "email": order.email or "",
            "status": order.status,
        }

        await self.publish(payload)
