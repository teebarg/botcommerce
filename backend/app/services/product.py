import json
from datetime import time, timedelta

from app.services.meilisearch import (
    get_document_by_id,
)

# Configuration
CACHE_EXPIRY = timedelta(hours=24)
RECENT_PRODUCTS_LIMIT = 10


def add_to_recently_viewed(cache, user_id: str, product_id: str):
    """Add product to user's recently viewed list"""
    key = f"recent_products:{user_id}"

    # Add to sorted set with timestamp as score
    cache.zadd(key, {product_id: time.time()})

    # Trim to keep only recent items
    cache.zremrangebyrank(key, 0, -RECENT_PRODUCTS_LIMIT - 1)

    # Set expiry on the key
    cache.expire(key, CACHE_EXPIRY)

def get_recently_viewed(cache, user_id: str) -> list[str]:
    """Get user's recently viewed products"""
    key = f"recent_products:{user_id}"
    return cache.zrevrange(key, 0, -1)


async def get_product(cache, product_id: str) -> dict | None:
    """Get product from cache, return None if not found"""
    key = f"product:{product_id}"
    cached_product = cache.get(key)

    if cached_product:
        return json.loads(cached_product)

    doc = get_document_by_id("products", product_id)

    # Cache the result
    cache.setex(key, CACHE_EXPIRY, json.dumps(doc))

    return doc