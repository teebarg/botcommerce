from typing import Optional, Any
from app.core.deps import RedisClient
from app.services.events import publish_event
from app.core.logging import get_logger
from fastapi import HTTPException

logger = get_logger(__name__)

async def log_user_interaction(redis: RedisClient, user_id: int, product_id: int, type: str, metadata: Optional[dict[str, Any]] = None):
    try:
        event = {
            "type": "RECENTLY_VIEWED",
            "view_type": type,
            "user_id": user_id,
            "product_id": product_id,
            "source": metadata.get("source", ""),
            "time_spent": metadata.get("timeSpent", 0)
        }
        await publish_event(cache=redis, event=event)
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e)) 
    return None