from datetime import datetime, timedelta
from functools import wraps
from typing import Any, Callable, Union

import asyncio
import hashlib
import json

from fastapi import Request
from redis import Redis

import logging
import json
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DEFAULT_EXPIRATION = int(timedelta(hours=24).total_seconds())

def handle_redis_errors(default: Any = None):
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                logger.error(f"Redis error in {func.__name__}: {str(e)}")
                return default
        return wrapper
    return decorator


class EnhancedJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime):
            return o.isoformat()
        try:
            return o.__dict__
        except Exception:
            return str(o)


class CacheService:
    def __init__(self, redis: Redis):
        self.redis = redis

    @handle_redis_errors(default=[])
    def keys(self, pattern: str) -> list[str]:
        return self.redis.keys(pattern)

    @handle_redis_errors(default=False)
    def ping(self) -> bool:
        return self.redis.ping()

    @handle_redis_errors(default=False)
    def hset(self, key: str, mapping: dict) -> bool:
        return self.redis.hset(key, mapping=mapping)

    @handle_redis_errors(default=False)
    def hset_field(self, key: str, field: str, value: Any) -> bool:
        return self.redis.hset(key, field, value)

    @handle_redis_errors()
    def hget(self, key: str, field: str) -> str | None:
        return self.redis.hget(key, field)

    @handle_redis_errors()
    def hgetall(self, key: str) -> dict[str, str] | None:
        return self.redis.hgetall(key)

    @handle_redis_errors(default=False)
    async def set(self, key: str, value: Any, expire: int | timedelta | None = DEFAULT_EXPIRATION, tag: str = None) -> bool:
        if isinstance(expire, timedelta):
            expire = int(expire.total_seconds())
        await self.redis.setex(key, expire, value)
        if tag:
            await self.redis.sadd(tag, key)

    @handle_redis_errors()
    async def get(self, key: str) -> str | None:
        return await self.redis.get(key)

    @handle_redis_errors(default=False)
    async def bust_tag(self, tag: str):
        keys = await self.redis.smembers(tag)
        if keys:
            await self.redis.delete(*keys)
        await self.redis.delete(tag)

    @handle_redis_errors(default=False)
    async def invalidate_list_cache(self, entity: str):
        """
        Invalidate all list/search cache entries for a given entity (e.g., "product", "collection").
        This should match the prefix used in @cache_response for list views.
        """
        async for tag in self.redis.scan_iter(match=f"{entity}:*"):
            await self.bust_tag(tag)

    @handle_redis_errors(default=False)
    def delete(self, key: str) -> bool:
        return bool(self.redis.delete(key))

    @handle_redis_errors(default=False)
    def exists(self, key: str) -> bool:
        return bool(self.redis.exists(key))

    @handle_redis_errors(default=False)
    def clear(self) -> bool:
        return bool(self.redis.flushdb())

    @handle_redis_errors(default=False)
    def invalidate(self, key: str) -> bool:
        return self.delete_pattern(f"{key}:*")

    @handle_redis_errors(default=False)
    def delete_pattern(self, pattern: str) -> bool:
        cursor = 0
        while True:
            cursor, keys = self.redis.scan(cursor, pattern, count=100)
            if keys:
                self.redis.delete(*keys)
            if cursor == 0:
                break
        return True

    @handle_redis_errors(default=0)
    def incr(self, key: str) -> int:
        return self.redis.incr(key)

    @handle_redis_errors(default=False)
    def expire(self, key: str, seconds: int) -> bool:
        return self.redis.expire(key, seconds)

async def get_redis_dependency(request: Request):
    return CacheService(request.app.state.redis)

async def invalidate_cache(cache: CacheService, keys: list[str]):
    for key in keys:
        await cache.delete_pattern(key)


def cache(key_prefix: str, key: Union[str, Callable[..., str], None] = None, expire: int = DEFAULT_EXPIRATION):
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request: Request = kwargs["request"]
            if not request:
                raise ValueError("FastAPI Request not found")

            cache = CacheService(request.app.state.redis)

            if isinstance(key, str):
                raw_key = f"{key_prefix}:{key}"
            elif callable(key):
                dynamic_key = key(*args, **kwargs)
                raw_key = f"{key_prefix}:{dynamic_key}"
            else:
                raw_key = f"{key_prefix}:{request.url.path}?{request.url.query}"

            redis_key = hashlib.md5(raw_key.encode()).hexdigest()

            cached = await cache.get(redis_key)
            if cached:
                return json.loads(cached)

            result = await func(*args, **kwargs)
            await cache.set(redis_key, json.dumps(result, cls=EnhancedJSONEncoder), expire, tag=raw_key)
            return result
        return wrapper
    return decorator
