import json
import inspect
import time
import asyncio
from collections import OrderedDict
from typing import Any, Callable, Union, Optional
from fastapi import Request
from redis.asyncio import Redis  # Explicit type hints for the team
from datetime import datetime, timedelta
from functools import wraps
from app.core.logging import get_logger
from app.services.websocket import manager
from app.lib.cache import set_public_cache

logger = get_logger(__name__)

DEFAULT_EXPIRATION = int(timedelta(days=7).total_seconds())
L1_INVALIDATE_CHANNEL = "cache:invalidate"

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


class L1Cache:
    """Process-local, size-bounded, short-TTL cache. Sits in front of Redis
    to absorb repeat reads within a single worker. Never a source of truth —
    a miss just falls through to Redis, so it's always safe to evict or
    undersize this. TTL should stay well below Redis's TTL; it's a burst
    absorber, not a second copy of the cache."""

    def __init__(self, max_size: int = 5000, ttl: float = 5.0):
        self.max_size = max_size
        self.ttl = ttl
        self._store: "OrderedDict[str, tuple[float, Any]]" = OrderedDict()

    def get(self, key: str) -> Optional[Any]:
        entry = self._store.get(key)
        if entry is None:
            return None
        expires_at, value = entry
        if expires_at < time.monotonic():
            self._store.pop(key, None)
            return None
        self._store.move_to_end(key)
        return value

    def set(self, key: str, value: Any) -> None:
        self._store[key] = (time.monotonic() + self.ttl, value)
        self._store.move_to_end(key)
        if len(self._store) > self.max_size:
            self._store.popitem(last=False)  # evict least-recently-used

    def delete(self, *keys: str) -> None:
        for k in keys:
            self._store.pop(k, None)

    def clear(self) -> None:
        self._store.clear()


async def run_l1_invalidation_listener(redis_client: Redis, l1: L1Cache) -> None:
    """Background task — one per worker process. Subscribes to the
    invalidation channel and evicts matching keys from this process's L1.
    Redis DEL only clears the shared store; this is what keeps every
    sibling worker's local cache in sync with it. Must be started in
    every worker, not just one."""
    pubsub = redis_client.pubsub()
    await pubsub.subscribe(L1_INVALIDATE_CHANNEL)
    try:
        async for message in pubsub.listen():
            if message["type"] != "message":
                continue
            try:
                payload = json.loads(message["data"])
                if payload == "__ALL__":
                    l1.clear()
                else:
                    l1.delete(*payload)
            except Exception as e:
                logger.error(f"[L1Cache] Bad invalidation message: {e}", exc_info=True)
    finally:
        await pubsub.unsubscribe(L1_INVALIDATE_CHANNEL)
        await pubsub.close()


class CacheService:
    def __init__(self, redis_client: Redis, l1: Optional[L1Cache] = None) -> None:
        self.redis = redis_client
        self.l1 = l1  # None disables L1 for this call site (e.g. sessions)

    async def clear_cache(self) -> None:
        """Clear the entire Redis database and every process's L1 cache."""
        try:
            result = await self.redis.flushdb()
            if self.l1 is not None:
                self.l1.clear()
            await self.redis.publish(L1_INVALIDATE_CHANNEL, json.dumps("__ALL__"))
            return result
        except Exception as e:
            logger.error(f"[Cache] Read failure: {e}", exc_info=True)
            return None

    async def get(self, key: str) -> Optional[Any]:
        """L1 -> Redis, write-through on L1 miss. No-op on failure."""
        if self.l1 is not None:
            hit = self.l1.get(key)
            if hit is not None:
                logger.debug(f"[Cache] L1 HIT: {key}")
                return hit
        try:
            cached = await self.redis.get(key)
            if cached is None:
                return None
            value = json.loads(cached)
            if self.l1 is not None:
                self.l1.set(key, value)
            return value
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
                pipe.setex(key, expire, serialized)
                for tag in tags:
                    tag_key = f"tag:{tag}"
                    pipe.zadd(tag_key, {key: expire_at})
                    pipe.expire(tag_key, expire)
                await pipe.execute()

            if self.l1 is not None:
                self.l1.set(key, value)
        except Exception as e:
            logger.error(f"[Cache] Write failure for key '{key}': {e}", exc_info=True)

    async def invalidate(self, *keys: str, tags: list[str] | None = None) -> None:
        """
        Surgically invalidates explicit keys and/or entire tag groups.
        Also evicts from this process's L1 and publishes to L1_INVALIDATE_CHANNEL
        so every sibling worker evicts its local copy.

        Usage:
            await service.invalidate("user:123", f"addresses:{id}")
            await service.invalidate(tags=["coupons", "products"])
        """
        tag_list = tags or []
        now = int(time.time())
        valid_keys = [k for k in keys if k and k.strip()]
        invalidated_keys = list(valid_keys)
        invalidated_keys.extend(tag_list)

        all_concrete_keys: set[str] = set(valid_keys)

        if valid_keys:
            try:
                async with self.redis.pipeline(transaction=False) as pipe:
                    pipe.delete(*valid_keys)
                    await pipe.execute()
            except Exception as e:
                logger.error(f"[Cache] Explicit invalidation failed for keys {valid_keys}: {e}", exc_info=True)

        for tag in tag_list:
            tag_key = f"tag:{tag}"
            try:
                async with self.redis.pipeline(transaction=False) as pipe:
                    pipe.zremrangebyscore(tag_key, 0, now)
                    pipe.zrange(tag_key, 0, -1)
                    _, active_keys = await pipe.execute()

                if active_keys:
                    all_concrete_keys.update(active_keys)
                    async with self.redis.pipeline(transaction=False) as pipe:
                        pipe.delete(*active_keys)
                        pipe.delete(tag_key)
                        await pipe.execute()
            except Exception as e:
                logger.error(f"[Cache] Tag invalidation failed for tag '{tag}': {e}", exc_info=True)

        if all_concrete_keys:
            if self.l1 is not None:
                self.l1.delete(*all_concrete_keys)
            try:
                await self.redis.publish(L1_INVALIDATE_CHANNEL, json.dumps(list(all_concrete_keys)))
            except Exception as e:
                logger.error(f"[Cache] L1 invalidation publish failed: {e}", exc_info=True)

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
    tags: Optional[Union[list[str], Callable[..., list[str]]]] = None,
    browser_ttl: Optional[int] = None,
    cdn_ttl: Optional[int] = None,
    cdn_swr: int = 3600,
):
    """Declarative route caching middleware supporting dynamic keys and tags."""
    def decorator(func: Callable[..., Any]):
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            request: Optional[Request] = kwargs.get("request")
            if not request:
                raise RuntimeError(f"Mandatory 'request: Request' parameter missing in {func.__name__}")

            cache = CacheService(
                request.app.state.redis,
                l1=getattr(request.app.state, "l1_cache", None),
            )

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

            if cdn_ttl is not None:
                set_public_cache(request, browser_ttl=browser_ttl or 30, edge_ttl=cdn_ttl, swr=cdn_swr)

            cached_data = await cache.get(raw_key)
            if cached_data is not None:
                return cached_data

            result = await func(*args, **kwargs)

            resolved_tags = []
            if callable(tags):
                sig = inspect.signature(tags)
                filtered_tags_kwargs = {k: v for k, v in kwargs.items() if k in sig.parameters}
                resolved_tags = tags(**filtered_tags_kwargs)
            elif isinstance(tags, list):
                resolved_tags = tags

            await cache.set_with_tags(key=raw_key, value=result, expire=expire, tags=resolved_tags)

            return result
        return wrapper
    return decorator