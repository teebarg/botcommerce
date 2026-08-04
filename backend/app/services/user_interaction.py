from typing import Optional, Any
from fastapi import HTTPException
from app.core.logging import get_logger
from app.core.dependencies.cache import CacheDep

logger = get_logger(__name__)

class InteractionService:

    def __init__(self, cache_srv: CacheDep):
        self.cache_srv = cache_srv

    async def log_user_interaction(
        self,
        user_id: int,
        product_id: int,
        type: str,
        metadata: Optional[dict[str, Any]] = None,
    ):
        metadata = metadata or {}
        try:
            await self.cache_srv.redis.enqueue_job(
                "recently_viewed",
                view_type=type,
                user_id=user_id,
                product_id=product_id,
                metadata=metadata,
            )
        except Exception as e:
            logger.error(f"Interaction logging failed: {e}")
            raise HTTPException(status_code=400, detail=str(e))