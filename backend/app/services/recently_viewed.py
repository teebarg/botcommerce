from typing import List
from datetime import datetime
from app.services.redis import CacheService
from app.services.meilisearch import get_or_create_index
from app.core.config import settings
from app.services.websocket import manager

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
            'old_price': product_data.get('old_price', 0),
            'variant_id': product_data.get('variant_id', None)
        })
        
        # Add to sorted set with timestamp as score
        await self.cache.zadd(key, {str(product_data['id']): timestamp})
        
        #keep only latest
        await self.cache.zremrangebyrank(key, 0, -(self.max_items + 1))

        await manager.send_to_user(
            user_id=user_id,
            data={"type": "recently_viewed"},
            message_type="recently_viewed",
        )

    async def get_recently_viewed(self, user_id: int, limit: int = 10) -> List[dict]:
        """Get user's recently viewed products"""
        key = await self.get_key(user_id)
        
        product_ids = await self.cache.zrevrange(key, 0, limit - 1)
        index = get_or_create_index(settings.MEILI_PRODUCTS_INDEX)
        
        products = []
        for pid in product_ids:
            # product_key = f"product:{pid}"
            product = index.get_document(int(pid))
            if product:
                products.append(product)
            # product_data = await self.cache.hgetall(product_key)
            # if product_data:
            #     products.append(product_data)
                
        return products