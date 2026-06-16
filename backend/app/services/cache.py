import json
import inspect
import time
import asyncio
from typing import Coroutine, List, Any, Callable, Union, Optional
from fastapi import Request
from datetime import datetime, timedelta
from functools import wraps
from app.core.logging import get_logger
from app.services.websocket import manager
from redis.asyncio import Redis  # Explicit type hints for the team

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
    def __init__(self, redis_client: Redis) -> None:
        self.redis = redis_client

    async def clear_cache(self)-> None:
        """Clear the entire Redis database"""
        try:
            return await self.redis.flushdb()
        except Exception as e:
            logger.error(f"[Cache] Read failure: {e}", exc_info=True)
            return None

    async def get(self, key: str) -> Optional[Any]:
        """Safely retrieves and deserializes JSON from Redis. No-op on failure."""
        try:
            cached = await self.redis.get(key)
            return json.loads(cached) if cached else None
        except Exception as e:
            logger.error(f"[Cache] Read failure for key '{key}': {e}", exc_info=True)
            return None

    async def set_session(self, session_id: str, data: dict, ttl=60 * 60 * 24 * 30):
        await self.redis.setex(f"session:{session_id}", ttl, json.dumps(data))

    async def get_session(self, session_id: str):
        data = await self.redis.get(f"session:{session_id}")
        return json.loads(data) if data else None

    async def delete_session(self, session_id: str):
        await self.redis.delete(f"session:{session_id}")

    async def set_with_tags(self, key: str, value: Any, expire: int, tags: list[str] = None) -> None:
        """
        Writes data to Redis and indexes it under tags using a Sorted Set (ZSET).
        Uses timestamps as scores to allow effortless garbage collection of expired keys.
        """
        tags = tags or []
        now = int(time.time())
        expire_at = now + expire
        
        try:
            serialized = json.dumps(value, cls=EnhancedJSONEncoder)
            
            async with self.redis.pipeline(transaction=False) as pipe:
                # Set payload with TTL
                pipe.setex(key, expire, serialized)
                
                # Index keys under tags
                for tag in tags:
                    tag_key = f"tag:{tag}"
                    pipe.zadd(tag_key, {key: expire_at})
                    pipe.expire(tag_key, expire)  # Prevent tag indexes from outliving data
                    
                await pipe.execute()
        except Exception as e:
            logger.error(f"[Cache] Write failure for key '{key}': {e}", exc_info=True)

    async def invalidate(self, *keys: str, tags: list[str] = None) -> None:
        """
        Surgically invalidates explicit keys and/or entire tag groups.
        Replaces dangerous, un-indexed O(N) database SCANs with highly efficient O(1) lookups.
        
        Usage:
            await service.invalidate("user:123", f"addresses:{id}")
            await service.invalidate(tags=["coupons", "products"])
        """
        tag_list = tags or []
        now = int(time.time())
        valid_keys = [k for k in keys if k and k.strip()]
        print("valid_keys........................")
        print(valid_keys)
        print(tag_list)
        invalidated_keys = list(valid_keys)
        invalidated_keys.extend(tag_list)

        # Batch delete explicit direct keys
        if valid_keys:
            try:
                async with self.redis.pipeline(transaction=False) as pipe:
                    pipe.delete(*valid_keys)
                    await pipe.execute()
            except Exception as e:
                logger.error(f"[Cache] Explicit invalidation failed for keys {valid_keys}: {e}", exc_info=True)

        # Tag-based invalidation via ZSET index lookups
        for tag in tag_list:
            tag_key = f"tag:{tag}"
            try:
                async with self.redis.pipeline(transaction=False) as pipe:
                    # Self-cleaning housekeeping: Evict dead elements from the tracking index
                    pipe.zremrangebyscore(tag_key, 0, now)
                    # Retrieve remaining active cache keys under this tag
                    pipe.zrange(tag_key, 0, -1)
                    _, active_keys = await pipe.execute()

                if active_keys:
                    # Cast bytes from Redis back to strings if necessary
                    # decoded_keys = [k.decode('utf-8') if isinstance(k, bytes) else k for k in active_keys]
                    # invalidated_keys.extend(decoded_keys)
                    
                    async with self.redis.pipeline(transaction=False) as pipe:
                        pipe.delete(*active_keys)
                        pipe.delete(tag_key)
                        await pipe.execute()
            except Exception as e:
                logger.error(f"[Cache] Tag invalidation failed for tag '{tag}': {e}", exc_info=True)

        # Synchronize cache invalidation downstream to edge clients over WebSockets
        if invalidated_keys:
            await manager.broadcast_to_all(
                data={"keys": list(set(invalidated_keys))},
                message_type="invalidate",
            )
            await asyncio.sleep(0.01)


def cacheable(
    key_prefix: str,
    key_builder: Optional[Union[str, bool, Callable[..., Any]]] = None,
    expire: int = DEFAULT_EXPIRATION,
    tags: Optional[Union[list[str], Callable[..., list[str]]]] = None  # <-- Can be a list OR a function
):
    """Declarative route caching middleware supporting dynamic keys and tags."""
    def decorator(func: Callable[..., Any]):
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            request: Optional[Request] = kwargs.get("request")
            if not request:
                raise RuntimeError(f"Mandatory 'request: Request' parameter missing in {func.__name__}")

            cache = CacheService(request.app.state.redis)

            # Evaluate Dynamic Cache Key
            if callable(key_builder):
                sig = inspect.signature(key_builder)
                filtered_kwargs = {k: v for k, v in kwargs.items() if k in sig.parameters}
                raw_key = f"{key_prefix}:{key_builder(**filtered_kwargs)}"
            elif isinstance(key_builder, str):
                raw_key = f"{key_prefix}:{key_builder}"
            elif isinstance(key_builder, bool) and key_builder == False:
                raw_key = f"{key_prefix}"
            else:
                raw_key = f"{key_prefix}:{request.url.path}?{request.url.query}"

            cached_data = await cache.get(raw_key)
            if cached_data is not None:
                return cached_data

            result = await func(*args, **kwargs)

            # Evaluate Dynamic Tags at Runtime
            resolved_tags = []
            if callable(tags):
                # Inspect the lambda to extract matching parameters from kwargs (like user)
                sig = inspect.signature(tags)
                filtered_tags_kwargs = {k: v for k, v in kwargs.items() if k in sig.parameters}
                resolved_tags = tags(**filtered_tags_kwargs)
            elif isinstance(tags, list):
                resolved_tags = tags

            await cache.set_with_tags(key=raw_key, value=result, expire=expire, tags=resolved_tags)

            return result
        return wrapper
    return decorator
