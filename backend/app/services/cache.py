import json
import time
from typing import List, Any, Callable, Union, Optional
from fastapi import Request
from typing import List, Any, Callable, Union, Optional
from datetime import datetime, timedelta
from functools import wraps
import json
import inspect
from fastapi import Request

from app.core.logging import get_logger
from app.services.websocket import manager

logger = get_logger(__name__)

DEFAULT_EXPIRATION = int(timedelta(days=7).total_seconds())

class EnhancedJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime):
            return o.isoformat()
        if isinstance(o, bytes):
            try:
                return o.decode('utf-8')
            except UnicodeDecodeError:
                return o.hex()
        if hasattr(o, '__dict__'):
            return o.__dict__
        return str(o)

class CacheService:
    def __init__(self, redis_client):
        self.redis = redis_client

    async def get(self, key: str) -> Optional[Any]:
        """Safely fetch and parse JSON from cache."""
        try:
            cached = await self.redis.get(key)
            return json.loads(cached) if cached else None
        except Exception as e:
            logger.error(f"[Cache] Read error for key {key}: {e}")
            return None

    async def set_with_tags(self, key: str, value: Any, expire: int, tags: List[str] = None):
        """
        Stores cache data and links it to tracking tags using a Sorted Set (ZSET).
        Scores match the expiration timestamp, preventing memory leaks.
        """
        try:
            now = int(time.time())
            expire_at = now + expire
            serialized_value = json.dumps(value, cls=EnhancedJSONEncoder)

            async with self.redis.pipeline(transaction=False) as pipe:
                # 1. Set the actual data cache
                pipe.setex(key, expire, serialized_value)

                # 2. Track tags using expiration time as score
                for tag in (tags or []):
                    tag_key = f"tag:{tag}"
                    pipe.zadd(tag_key, {key: expire_at})
                    pipe.expire(tag_key, expire)  # Keep the tag set alive
                
                await pipe.execute()
        except Exception as e:
            logger.error(f"[Cache] Write error for key {key}: {e}")

    async def invalidate_tag(self, tag: str) -> None:
        """
        Invalidates all active keys associated with a tag and 
        cleans up any naturally expired keys from the tracking set.
        """
        tag_key = f"tag:{tag}"
        now = int(time.time())

        try:
            async with self.redis.pipeline(transaction=False) as pipe:
                # Proactive Housekeeping: Remove naturally expired keys from this tag set
                pipe.zremrangebyscore(tag_key, 0, now)
                # Fetch all remaining active keys under this tag
                pipe.zrange(tag_key, 0, -1)
                _, active_keys = await pipe.execute()

            if not active_keys:
                return

            # Delete the actual data keys and the tag tracking index itself
            async with self.redis.pipeline(transaction=False) as pipe:
                pipe.delete(*active_keys)
                pipe.delete(tag_key)
                await pipe.execute()
                
        except Exception as e:
            logger.error(f"[Cache] Invalidation error for tag {tag}: {e}")


def cache_response(
    key_prefix: str,
    key: Union[str, Callable[..., str], None] = None,
    expire: int = DEFAULT_EXPIRATION,
    tags: List[str] = None,
):
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request: Request = kwargs.get("request")
            if not request:
                raise ValueError("FastAPI Request object missing from endpoint arguments.")

            # Resolve the CacheService from app state
            redis_client = request.app.state.redis
            cache = CacheService(redis_client)

            # Build Cache Key
            if isinstance(key, str):
                raw_key = f"{key_prefix}:{key}"
            elif callable(key):
                sig = inspect.signature(key)
                filtered_kwargs = {k: v for k, v in kwargs.items() if k in sig.parameters.keys()}
                raw_key = f"{key_prefix}:{key(**filtered_kwargs)}"
            else:
                raw_key = f"{key_prefix}:{request.url.path}?{request.url.query}"

            # 1. Read hit
            cached_data = await cache.get(raw_key)
            if cached_data is not None:
                return cached_data

            # 2. Cache miss -> Execute function
            result = await func(*args, **kwargs)

            # 3. Write back safely using the new ZSET implementation
            await cache.set_with_tags(key=raw_key, value=result, expire=expire, tags=tags)

            return result
        return wrapper
    return decorator