from datetime import datetime, timedelta
from functools import wraps
from typing import Any, Callable, Union

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

async def get_redis_dependency(request: Request):
    return request.app.state.redis


def cache(key_prefix: str, key: Union[str, Callable[..., str], None] = None, expire: int = DEFAULT_EXPIRATION):
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request: Request = kwargs["request"]
            if not request:
                raise ValueError("FastAPI Request not found")

            redis = request.app.state.redis

            if isinstance(key, str):
                raw_key = f"{key_prefix}:{key}"
            elif callable(key):
                dynamic_key = key(*args, **kwargs)
                raw_key = f"{key_prefix}:{dynamic_key}"
            else:
                raw_key = f"{key_prefix}:{request.url.path}?{request.url.query}"

            cached = await redis.get(raw_key)
            if cached:
                return json.loads(cached)

            result = await func(*args, **kwargs)
            await redis.setex(raw_key, expire, json.dumps(result, cls=EnhancedJSONEncoder))
            return result
        return wrapper
    return decorator
