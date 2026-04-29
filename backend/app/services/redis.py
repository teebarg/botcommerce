from typing import List, Any, Callable, Union, Optional
from datetime import datetime, timedelta
from functools import wraps

import json
import inspect
from fastapi import Request
from app.redis_client import redis_client
from app.core.logging import logger
from app.services.websocket import manager

DEFAULT_EXPIRATION = int(timedelta(days=7).total_seconds())

def handle_redis_errors(default: Any = None):
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
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


@handle_redis_errors(default=False)
async def publish_event(event_name: str, payload: dict[str, Any]) -> bool:
    """
    Append an event to a Redis Stream for durable consumption by consumers.
    Stream key format: "events:{event_name}". Payload is stored under the "data" field as JSON.
    """
    stream_key: str = f"events:{event_name}"
    data = {"data": json.dumps(payload, cls=EnhancedJSONEncoder)}
    await redis_client.xadd(stream_key, data)
    return True


@handle_redis_errors(default=False)
async def invalidate_list(entity: str):
    """
    Invalidate all list/search redis entries for a given entity (e.g., "products:*").
    """
    pattern = f"{entity}:*"
    cursor = 0

    while True:
        cursor, keys = await redis_client.scan(cursor=cursor, match=pattern, count=5000)
        if keys:
            await redis_client.delete(*keys)
        if cursor == 0:
            break

async def get_redis_dependency(request: Request):
    return request.app.state.redis

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
                raise ValueError("FastAPI Request not found")

            redis = request.app.state.redis

            if isinstance(key, str):
                raw_key = f"{key_prefix}:{key}"
            elif callable(key):
                sig = inspect.signature(key)
                allowed_params = sig.parameters.keys()
                filtered_kwargs = {k: v for k, v in kwargs.items() if k in allowed_params}
                raw_key = f"{key_prefix}:{key(**filtered_kwargs)}"
            else:
                raw_key = f"{key_prefix}:{request.url.path}?{request.url.query}"

            cached = await redis.get(raw_key)
            if cached is not None:
                return json.loads(cached)

            result = await func(*args, **kwargs)

            async with redis.pipeline(transaction=False) as pipe:
                pipe.setex(raw_key, expire, json.dumps(result, cls=EnhancedJSONEncoder))
                for tag in (tags or []):
                    pipe.sadd(f"tag:{tag}", raw_key)
                    pipe.expire(f"tag:{tag}", expire)
                await pipe.execute()

            return result
        return wrapper
    return decorator


async def set_session(session_id: str, data: dict, ttl=60 * 60 * 24 * 30):
    await redis_client.setex(f"session:{session_id}", ttl, json.dumps(data))

async def get_session(session_id: str):
    data = await redis_client.get(f"session:{session_id}")
    return json.loads(data) if data else None

async def delete_session(session_id: str):
    await redis_client.delete(f"session:{session_id}")


async def delete_cache_keys_by_tag(tag: Optional[str] = None) -> None:
    """
    Deletes:
      1. All tag sets matching tag:<tag>:*
      2. All cache keys stored inside those sets

    Example:
        tag:product:123 -> {"product:slug:shoe-1"}
    """
    if not tag:
        raise ValueError("tag is required")

    cursor = 0
    pattern = f"tag:{tag}:*"

    while True:
        cursor, tag_keys = await redis_client.scan(
            cursor=cursor,
            match=pattern,
            count=100,
        )

        for tag_key in tag_keys:
            members = await redis_client.smembers(tag_key)

            async with redis_client.pipeline(transaction=False) as pipe:
                if members:
                    pipe.delete(*members)

                pipe.delete(tag_key)
                await pipe.execute()

        if cursor == 0:
            break

PRODUCT_CACHE_TAGS = ["product","products", "gallery"]

async def refresh_product(ids: int | List[int]=None, tags: List[str] = None, full: bool = False) -> None:
    tags_to_invalidate = tags or PRODUCT_CACHE_TAGS
    def normalize(value):
        if value is None:
            return []
        if isinstance(value, int):
            return [f"product:{value}"]
        return [f"product:{id}" for id in value]

    for tag in tags_to_invalidate + normalize(ids):
        await cache_invalidate_tag(tag)

    if full:
        await delete_cache_keys_by_tag("product")

    await manager.broadcast_to_all(
        data={"keys": tags_to_invalidate},
        message_type="invalidate",
    )

async def refresh_data(keys: List[str] = None, patterns: List[str] = None) -> None:
    """
    Invalidate specific keys and/or patterns.

    Example:
        await invalidate(
            keys=[f"addresses:{user_id}", f"address:{address_id}"],
            patterns=["addresses"]
        )
    """
    key_list = keys or []
    pattern_list = patterns or []

    if key_list:
        try:
            async with redis_client.pipeline(transaction=False) as pipe:
                for key in key_list:
                    pipe.delete(key)
                await pipe.execute()
        except Exception as e:
            logger.error(f"Error invalidating keys {key_list}: {e}")

    for pattern in pattern_list:
        try:
            cursor = 0
            while True:
                cursor, matched_keys = await redis_client.scan(
                    cursor, match=f"{pattern}*", count=100
                )
                if matched_keys:
                    async with redis_client.pipeline(transaction=False) as pipe:
                        for key in matched_keys:
                            pipe.delete(key)
                        await pipe.execute()
                if cursor == 0:
                    break
        except Exception as e:
            logger.error(f"Error invalidating pattern {pattern}: {e}")


async def cache_invalidate_tag(tag: str) -> None:
    tag_key = f"tag:{tag}"
    keys = await redis_client.smembers(tag_key)

    if not keys:
        return

    async with redis_client.pipeline(transaction=False) as pipe:
        pipe.delete(*keys)
        pipe.delete(tag_key)
        await pipe.execute()
