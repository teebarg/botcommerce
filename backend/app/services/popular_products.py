from typing import List
from app.core.logging import get_logger
from app.core.config import settings
from app.services.meilisearch import get_or_create_index
from app.redis_client import redis_client

logger = get_logger(__name__)

class PopularProductsService:
    def __init__(self):
        self.max_items = 50

    POPULARITY_KEY = "popular_products"

    WEIGHTS = {
        "view": 1,
        "add_to_cart": 2,
        "purchase": 5
    }

    async def track_product_interaction(self, product_id: int, interaction_type: str):
        """Track a product interaction and update its popularity score"""
        try:
            # Increment score in sorted set
            weight = self.WEIGHTS.get(interaction_type, 0)
            await redis_client.zincrby(self.POPULARITY_KEY, weight, str(product_id))

            await redis_client.zremrangebyrank(self.POPULARITY_KEY, 0, -(self.max_items + 1))

        except Exception as e:
            logger.error(f"Error tracking product interaction: {str(e)}")

    async def get_popular_products(self, limit: int = 10) -> List[dict]:
        """Get the most popular products"""
        try:
            product_ids = await redis_client.zrevrange(self.POPULARITY_KEY, 0, limit - 1)
            index = get_or_create_index(settings.MEILI_PRODUCTS_INDEX)

            products = []
            for pid in product_ids:
                try:
                    product = index.get_document(int(pid))
                    if product:
                        products.append(product)
                except Exception as e:
                    logger.error(f"Error getting popular product: {str(e)}")

            return products

        except Exception as e:
            logger.error(f"Error getting popular products: {str(e)}")
            return []

    async def remove_product(self, product_id: int):
        """Remove a product from the popular products list"""
        try:
            await redis_client.zrem(self.POPULARITY_KEY, str(product_id))
        except Exception as e:
            logger.error(f"Error removing product from popular products: {str(e)}")

    async def remove_product_from_all(self, product_id: int):
        """Remove a product from all users' popular products list"""
        keys = await redis_client.keys("popular_products*")
        for key in keys:
            await redis_client.zrem(key, str(product_id))

    async def decay_scores(self, decay_factor: float = 0.95):
        """Decay popularity scores over time"""
        try:
            products = await redis_client.zrange(self.POPULARITY_KEY, 0, -1, withscores=True)

            for product_id, score in products:
                new_score = score * decay_factor
                await redis_client.zadd(self.POPULARITY_KEY, {product_id: new_score})

        except Exception as e:
            logger.error(f"Error decaying popularity scores: {str(e)}")