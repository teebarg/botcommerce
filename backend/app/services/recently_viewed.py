from app.services.search import SearchService
from typing import List
from datetime import datetime
from app.core.logging import get_logger
from app.redis_client import redis_client
from app.services.cache import CacheService

logger = get_logger(__name__)

class RecentlyViewedService:
    def __init__(self, cache: CacheService, search_srv: SearchService):
        self.max_items = 12
        self.cache = cache
        self.search_srv = search_srv

    async def get_key(self, user_id: int) -> str:
        return f"recently_viewed:{user_id}"

    async def add_product(self, user_id: int, product_id: int):
        """Add a product to user's recently viewed list"""
        key = await self.get_key(user_id)
        timestamp = datetime.now().timestamp()

        # Add to sorted set with timestamp as score
        await redis_client.zadd(key, {str(product_id): timestamp})

        await redis_client.zremrangebyrank(key, 0, -(self.max_items + 1))

        await self.cache.invalidate(f"products:recently-viewed:{user_id}")

    async def remove_product_from_all(self, product_id: int):
        """Remove a product from all users' recently viewed list"""
        keys = await redis_client.keys("recently_viewed:*")
        try:
            for key in keys:
                await redis_client.zrem(key, str(product_id))

            await self.cache.invalidate(tags=["products:recently-viewed"])
        except Exception as e:
            logger.error(f"Error removing product from recently viewed list: {str(e)}")

    async def get_recently_viewed(self, user_id: int, limit: int = 10) -> List[dict]:
        """Get user's recently viewed products"""
        key: str = await self.get_key(user_id)

        product_ids = await redis_client.zrevrange(key, 0, limit - 1)

        products = []
        for pid in product_ids:
            try:
                product = self.search_srv.get_document_by_id(doc_id=pid)
                if product:
                    products.append(product)
            except Exception as e:
                logger.error(f"Error getting product: {str(e)}")

        return products