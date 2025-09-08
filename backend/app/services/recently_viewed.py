from typing import List
from datetime import datetime
from app.services.redis import CacheService
from app.services.meilisearch import get_or_create_index
from app.core.config import settings
from app.services.websocket import manager
from app.core.logging import get_logger

logger = get_logger(__name__)

class RecentlyViewedService:
    def __init__(self, cache: CacheService):
        self.cache = cache
        self.max_items = 12

    async def get_key(self, user_id: int) -> str:
        return f"recently_viewed:{user_id}"

    async def add_product(self, user_id: int, product_id: int):
        """Add a product to user's recently viewed list"""
        key = await self.get_key(user_id)
        timestamp = datetime.now().timestamp()

        # Add to sorted set with timestamp as score
        await self.cache.zadd(key, {str(product_id): timestamp})

        await self.cache.zremrangebyrank(key, 0, -(self.max_items + 1))

        await self.cache.invalidate_list_cache(f"user_recently_viewed:{user_id}")

        await manager.send_to_user(
            user_id=user_id,
            data={"type": "recently_viewed"},
            message_type="recently_viewed",
        )

    async def remove_product_from_all(self, product_id: int):
        """Remove a product from all users' recently viewed list"""
        keys = await self.cache.keys("recently_viewed:*")
        try:
            for key in keys:
                await self.cache.zrem(key, str(product_id))

            await self.cache.invalidate_list_cache("user_recently_viewed")
        except Exception as e:
            logger.error(f"Error removing product from recently viewed list: {str(e)}")

    async def get_recently_viewed(self, user_id: int, limit: int = 10) -> List[dict]:
        """Get user's recently viewed products"""
        key = await self.get_key(user_id)

        product_ids = await self.cache.zrevrange(key, 0, limit - 1)
        index = get_or_create_index(settings.MEILI_PRODUCTS_INDEX)

        products = []
        for pid in product_ids:
            try:
                product = index.get_document(int(pid))
                if product:
                    products.append(product)
            except Exception as e:
                logger.error(f"Error getting product: {str(e)}")

        return products