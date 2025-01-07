import hashlib
import json
from datetime import time, timedelta
from typing import List, Optional

from redis import Redis

from app.core.config import settings
from app.services.meilisearch import get_document_by_attribute, get_document_by_id, search_documents

# Initialize clients
redis_client = Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    password=settings.REDIS_PASSWORD,
    ssl=True,
    decode_responses=True,
)

# Configuration
CACHE_EXPIRY = timedelta(hours=24)
RECENT_PRODUCTS_LIMIT = 10


class SearchService:
    def __init__(self, redis: Redis):
        self.redis = redis

    def _generate_cache_key(self, query: str, filters: dict = None) -> str:
        """Generate a unique cache key based on search parameters"""
        key_parts = [query]
        if filters:
            key_parts.append(json.dumps(filters, sort_keys=True))
        key_string = "_".join(key_parts)
        return f"search:{hashlib.md5(key_string.encode()).hexdigest()}"

    async def search_products(
        self,
        query: str,
        filters: dict = None,
    ) -> dict:
        """Search products with Redis caching"""
        cache_key = self._generate_cache_key(query=query, filters=filters)

        # Try to get from cache
        cached_result = self.redis.get(cache_key)
        if cached_result:
            return json.loads(cached_result)

        search_result = search_documents(index_name="products", query=query, **filters)

        # Cache the result
        self.redis.setex(cache_key, CACHE_EXPIRY, json.dumps(search_result))

        return search_result

    def add_to_recently_viewed(self, user_id: str, product_id: str):
        """Add product to user's recently viewed list"""
        key = f"recent_products:{user_id}"

        # Add to sorted set with timestamp as score
        self.redis.zadd(key, {product_id: time.time()})

        # Trim to keep only recent items
        self.redis.zremrangebyrank(key, 0, -RECENT_PRODUCTS_LIMIT - 1)

        # Set expiry on the key
        self.redis.expire(key, CACHE_EXPIRY)

    def get_recently_viewed(self, user_id: str) -> List[str]:
        """Get user's recently viewed products"""
        key = f"recent_products:{user_id}"
        return self.redis.zrevrange(key, 0, -1)

    def invalidate_product_cache(self, product_id: str):
        """Invalidate cache when a product is updated"""
        # Get all keys that might contain this product
        search_keys = self.redis.keys("search:*")

        # Delete all related cache entries
        if search_keys:
            self.redis.delete(*search_keys)

    async def get_product(self, product_id: str) -> Optional[dict]:
        """Get product from cache, return None if not found"""
        key = f"product:{product_id}"
        cached_product = self.redis.get(key)

        if cached_product:
            return json.loads(cached_product)

        doc = get_document_by_id("products", product_id)

        # Cache the result
        self.redis.setex(key, CACHE_EXPIRY, json.dumps(doc))

        return doc

    async def get_product_by_slug(self, slug: str) -> Optional[dict]:
        """Get product from cache, return None if not found"""
        key = f"product:{slug}"
        cached_product = self.redis.get(key)

        if cached_product:
            return json.loads(cached_product)

        doc = get_document_by_attribute("products", attribute="slug", value=slug)

        # Cache the result
        self.redis.setex(key, CACHE_EXPIRY, json.dumps(doc))

        return doc

    def cache_product(self, product_id: str, product_data: dict):
        """Cache a product"""
        key = f"product:{product_id}"
        self.redis.setex(key, CACHE_EXPIRY, json.dumps(product_data))


# Dependencies
async def get_search_service():
    return SearchService(redis_client)
