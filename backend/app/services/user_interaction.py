from typing import Optional, Any
from fastapi import HTTPException
from arq.connections import ArqRedis
from app.core.logging import get_logger

logger = get_logger(__name__)

class InteractionService:
    def __init__(self, queue: ArqRedis):
        self.queue = queue

    async def log_user_interaction(
        self,
        user_id: int,
        product_id: int,
        type: str,
        metadata: Optional[dict[str, Any]] = None,
    ):
        metadata = metadata or {}
        try:
            await self.queue.enqueue_job(
                "recently_viewed",
                view_type=type,
                user_id=user_id,
                product_id=product_id,
                metadata=metadata,
            )
        except Exception as e:
            logger.error(f"Interaction logging failed: {e}")
            raise HTTPException(status_code=400, detail=str(e))