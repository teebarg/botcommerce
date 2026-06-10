from typing import Optional, Any
from app.services.events import EventBus
from fastapi import HTTPException
from app.core.logging import get_logger

logger = get_logger(__name__)

class InteractionService:

    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus

    async def log_user_interaction(
        self,
        user_id: int,
        product_id: int,
        type: str,
        metadata: Optional[dict[str, Any]] = None,
    ):
        metadata = metadata or {}
        try:
            event = {
                "type": "RECENTLY_VIEWED",
                "view_type": type,
                "user_id": user_id,
                "product_id": product_id,
                "source": metadata.get("source", ""),
                "time_spent": metadata.get("timeSpent", 0),
            }
            await self.event_bus.publish(event)
        except Exception as e:
            logger.error(f"Interaction logging failed: {e}")
            raise HTTPException(status_code=400, detail=str(e))