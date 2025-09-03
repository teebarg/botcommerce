from typing import List
from app.services.redis import CacheService
from app.core.logging import logger
from app.core.config import settings
from app.services.meilisearch import get_or_create_index

class PopularProductsService:
    def __init__(self, cache: CacheService):
        self.cache = cache
        self.max_items = 50  # Maximum number of items to track
        
    POPULARITY_KEY = "popular_products"
    PRODUCT_DETAILS_KEY = "product_details:{}"
    
    # Weights for different actions
    WEIGHTS = {
        "view": 1,
        "add_to_cart": 2,
        "purchase": 5
    }
    
    async def track_product_interaction(self, product_id: int, interaction_type: str):
        """Track a product interaction and update its popularity score"""
        try:
            # Store product details in a hash
            product_key = self.PRODUCT_DETAILS_KEY.format(product_id)
            await self.cache.hset(product_key, mapping={
                'id': str(product_id),
            })
            
            # Increment score in sorted set
            weight = self.WEIGHTS.get(interaction_type, 0)
            await self.cache.zincrby(self.POPULARITY_KEY, weight, str(product_id))
            
            # Trim to keep only top max_items
            await self.cache.zremrangebyrank(self.POPULARITY_KEY, 0, -(self.max_items + 1))
            
        except Exception as e:
            logger.error(f"Error tracking product interaction: {str(e)}")

    async def get_popular_products(self, limit: int = 10) -> List[dict]:
        """Get the most popular products"""
        try:
            # Get product IDs from sorted set, highest score first
            product_ids = await self.cache.zrevrange(self.POPULARITY_KEY, 0, limit - 1)
            index = get_or_create_index(settings.MEILI_PRODUCTS_INDEX)
            
            products = []
            for pid in product_ids:
                product = index.get_document(int(pid))
                if product:
                    products.append(product)
                    
            return products
            
        except Exception as e:
            logger.error(f"Error getting popular products: {str(e)}")
            return []

    async def decay_scores(self, decay_factor: float = 0.95):
        """Decay popularity scores over time"""
        try:
            # Get all product scores
            products = await self.cache.zrange(self.POPULARITY_KEY, 0, -1, withscores=True)
            
            # Apply decay factor to each score
            for product_id, score in products:
                new_score = score * decay_factor
                await self.cache.zadd(self.POPULARITY_KEY, {product_id: new_score})
                
        except Exception as e:
            logger.error(f"Error decaying popularity scores: {str(e)}")