from datetime import datetime, timedelta
from functools import wraps
from typing import Any, Callable

import asyncio
import hashlib
import json

from fastapi import Request
from redis import Redis

from app.core.logging import logger
from app.core.deps import RedisClient
import json
from datetime import datetime

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
    async def set(self, key: str, value: Any, expire: int | timedelta | None = DEFAULT_EXPIRATION) -> bool:
        if isinstance(expire, timedelta):
            expire = int(expire.total_seconds())
        return await self.redis.set(key, value, ex=expire)

    @handle_redis_errors()
    async def get(self, key: str) -> str | None:
        return await self.redis.get(key)

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


async def get_cache_service(redis_client: RedisClient):
    return CacheService(redis_client)

async def invalidate_cache(cache: CacheService, keys: list[str]):
    for key in keys:
        await cache.delete_pattern(key)


def cache_response(key_prefix: str, expire: int = DEFAULT_EXPIRATION):
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request: Request = kwargs["request"]
            cache = CacheService(request.app.state.redis)
            if not request:
                raise ValueError("FastAPI Request not found")

            raw_key = f"{key_prefix}:{request.url.path}?{request.url.query}"
            key = hashlib.md5(raw_key.encode()).hexdigest()

            cached = await cache.get(key)
            if cached:
                return json.loads(cached)

            result = await func(*args, **kwargs)
            await cache.set(key, json.dumps(result, cls=EnhancedJSONEncoder), expire)
            return result
        return wrapper
    return decorator


STALE_TTL_SECONDS = 60 * 5

def stale_while_revalidate(key_prefix: str, expire: int = DEFAULT_EXPIRATION):
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request: Request = kwargs["request"]
            cache: CacheService = kwargs["cache"]

            raw_key = f"{key_prefix}:{request.url.path}?{request.url.query}"
            hashed_key = hashlib.md5(raw_key.encode()).hexdigest()
            data_key = f"{hashed_key}:data"
            ts_key = f"{hashed_key}:ts"

            cached_data = await cache.get(data_key)
            cached_ts = await cache.get(ts_key)

            if cached_data:
                if cached_ts:
                    ts = datetime.fromisoformat(cached_ts)
                    age = (datetime.utcnow() - ts).total_seconds()

                    if age > STALE_TTL_SECONDS:
                        asyncio.create_task(_revalidate_and_cache(func, args, kwargs, cache, data_key, ts_key, expire))

                return json.loads(cached_data)

            return await _revalidate_and_cache(func, args, kwargs, cache, data_key, ts_key, expire)

        return wrapper
    return decorator


async def _revalidate_and_cache(func, args, kwargs, cache, data_key, ts_key, expire):
    result = await func(*args, **kwargs)
    try:
        await cache.set(data_key, json.dumps(result), expire)
        await cache.set(ts_key, datetime.utcnow().isoformat(), expire)
    except Exception as e:
        logger.error(f"Error caching revalidated data: {str(e)}")
    return result
