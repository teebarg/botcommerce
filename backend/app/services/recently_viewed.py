from typing import List
from datetime import datetime
from app.services.redis import CacheService

class RecentlyViewedService:
    def __init__(self, cache: CacheService):
        self.cache = cache
        self.max_items = 12

    async def get_key(self, user_id: int) -> str:
        return f"recently_viewed:{user_id}"

    async def add_product(self, user_id: int, product_data: dict):
        """Add a product to user's recently viewed list"""
        key = await self.get_key(user_id)
        timestamp = datetime.now().timestamp()
        
        product_key = f"product:{product_data['id']}"
        await self.cache.hset(product_key, mapping={
            'id': int(product_data['id']),
            'name': product_data['name'],
            'slug': product_data['slug'],
            'image': product_data.get('image', ''),
            'price': product_data.get('price', 0),
            'old_price': product_data.get('old_price', 0)
        })
        
        # Add to sorted set with timestamp as score
        await self.cache.zadd(key, {str(product_data['id']): timestamp})
        
        #keep only latest
        await self.cache.zremrangebyrank(key, 0, -(self.max_items + 1))

    async def get_recently_viewed(self, user_id: int, limit: int = 10) -> List[dict]:
        """Get user's recently viewed products"""
        key = await self.get_key(user_id)
        
        product_ids = await self.cache.zrevrange(key, 0, limit - 1)
        
        products = []
        for pid in product_ids:
            product_key = f"product:{pid}"
            product_data = await self.cache.hgetall(product_key)
            if product_data:
                products.append(product_data)
                
        return products