from typing import List, Any, Callable, Union
from datetime import datetime, timedelta
from functools import wraps

import json
import asyncio
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

def cache_response(key_prefix: str, key: Union[str, Callable[..., str], None] = None, expire: int = DEFAULT_EXPIRATION):
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request: Request = kwargs.get("request")
            if not request:
                raise ValueError("FastAPI Request not found")

            redis = request.app.state.redis

            if isinstance(key, str):
                raw_key: str = f"{key_prefix}:{key}"
            elif callable(key):
                sig = inspect.signature(key)
                allowed_params = sig.parameters.keys()
                filtered_kwargs = {
                    k: v for k, v in kwargs.items() if k in allowed_params
                }
                dynamic_key: str = key(**filtered_kwargs)
                raw_key: str = f"{key_prefix}:{dynamic_key}"
            else:
                raw_key: str = f"{key_prefix}:{request.url.path}?{request.url.query}"

            cached = await redis.get(raw_key)
            if cached is not None:
                return json.loads(cached)

            result = await func(*args, **kwargs)
            await redis.setex(raw_key, expire, json.dumps(result, cls=EnhancedJSONEncoder))
            return result
        return wrapper
    return decorator

@handle_redis_errors(default=None)
async def invalidate_keys(pattern: str) -> None:
    """
    Delete all Redis keys matching pattern.
    """
    try:
        keys = await redis_client.keys(f"{pattern}*")
        if keys:
            await redis_client.delete(*keys)
    except Exception as e:
        logger.error(f"Error invalidating list {pattern}: {e}")


@handle_redis_errors(default=None)
async def invalidate_key_only(key: str) -> None:
    """
    Delete a specific Redis key and notify websocket clients.
    """
    try:
        await redis_client.delete(key)
    except Exception as e:
        logger.error(f"Error invalidating key {key}: {e}")


async def set_session(session_id: str, data: dict, ttl=60 * 60 * 24 * 30):
    await redis_client.setex(f"session:{session_id}", ttl, json.dumps(data))

async def get_session(session_id: str):
    data = await redis_client.get(f"session:{session_id}")
    return json.loads(data) if data else None

async def delete_session(session_id: str):
    await redis_client.delete(f"session:{session_id}")


async def refresh_data(*, keys=None, patterns=None) -> None:
    """
    Invalidate redis keys/patterns and broadcast affected frontend keys.

    Example:
        await refresh_data(
            keys=[f"order:{id}", f"order-timeline:{id}"],
            patterns="orders",
        )
    """
    def normalize(value):
        if value is None:
            return []
        if isinstance(value, str):
            return [value]
        return list(value)

    key_list = normalize(keys)
    pattern_list = normalize(patterns)
    print("🚀 ~ file: redis.py:154 ~ pattern_list + key_list:", pattern_list + key_list)

    tasks = []

    for key in key_list:
        tasks.append(invalidate_key_only(key=key))

    for pattern in pattern_list:
        tasks.append(invalidate_keys(pattern=pattern))

    if tasks:
        await asyncio.gather(*tasks)

    await manager.broadcast_to_all(
        data={"keys": pattern_list + key_list},
        message_type="invalidate",
    )
