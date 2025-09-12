from typing import List
from datetime import datetime
from app.services.meilisearch import get_or_create_index
from app.core.config import settings
from app.services.websocket import manager
from app.core.logging import get_logger
from app.redis_client import redis_client
from app.services.redis import invalidate_list

logger = get_logger(__name__)

class RecentlyViewedService:
    def __init__(self):
        self.max_items = 12

    async def get_key(self, user_id: int) -> str:
        return f"recently_viewed:{user_id}"

    async def add_product(self, user_id: int, product_id: int):
        """Add a product to user's recently viewed list"""
        key = await self.get_key(user_id)
        timestamp = datetime.now().timestamp()

        # Add to sorted set with timestamp as score
        await redis_client.zadd(key, {str(product_id): timestamp})

        await redis_client.zremrangebyrank(key, 0, -(self.max_items + 1))

        await invalidate_list(f"user_recently_viewed:{user_id}")

        await manager.send_to_user(
            user_id=user_id,
            data={"key": "products:recently-viewed"},
            message_type="invalidate",
        )

    async def remove_product_from_all(self, product_id: int):
        """Remove a product from all users' recently viewed list"""
        keys = await redis_client.keys("recently_viewed:*")
        try:
            for key in keys:
                await redis_client.zrem(key, str(product_id))

            await invalidate_list("user_recently_viewed")
        except Exception as e:
            logger.error(f"Error removing product from recently viewed list: {str(e)}")

    async def get_recently_viewed(self, user_id: int, limit: int = 10) -> List[dict]:
        """Get user's recently viewed products"""
        key = await self.get_key(user_id)

        product_ids = await redis_client.zrevrange(key, 0, limit - 1)
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