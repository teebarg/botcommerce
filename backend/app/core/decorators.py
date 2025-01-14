from app.services.cache import get_cache_service
from fastapi import  HTTPException
from functools import wraps
import re
import json
from typing import Callable, Optional

def limit(rate_string: str):
    """
    Rate limiting decorator that accepts strings like "5/minute", "10/hour", etc.
    Usage: @limit("5/minute")
    """
    pattern = r"(\d+)/(\w+)"
    match = re.match(pattern, rate_string)
    
    if not match:
        raise ValueError("Rate string must be in format 'number/period' (e.g., '5/minute')")
    
    max_requests = int(match.group(1))
    period = match.group(2).lower()
    
    # Convert period to seconds
    time_periods = {
        "second": 1,
        "minute": 60,
        "hour": 3600,
        "day": 86400
    }
    
    if period not in time_periods and period + "s" not in time_periods:
        raise ValueError(f"Invalid time period. Must be one of: {', '.join(time_periods.keys())}")
    
    # Handle both singular and plural forms
    period_seconds = time_periods.get(period) or time_periods.get(period[:-1])

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract request and redis from kwargs
            request = kwargs.get('request')
            redis = kwargs.get('redis')
            
            if not request or not redis:
                raise ValueError("Rate limiting requires 'request' and 'redis' parameters")
            
            client_ip = request.client.host
            key = f"rate_limit:{client_ip}:{func.__name__}"
            
            # Increment the request count
            current_count = redis.incr(key)
            
            if current_count == 1:
                # Set the expiration for the first request
                redis.expire(key, period_seconds)
            
            if current_count > max_requests:
                raise HTTPException(
                    status_code=429,
                    detail=f"Rate limit exceeded. Maximum {max_requests} requests per {period} allowed."
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def cache(expire: int = 86400, key: Optional[str] = None):
    """
    Decorator to cache the result of a function.
    Args:
        expire: Expiration time in seconds for the cache.
        key: Optional custom key for caching. If not provided, a key is generated.
    """
    def generate_cache_key(key: str, func_name: str, args: tuple, kwargs: dict) -> str:
        """
        Generate a consistent cache key based on the function name and normalized arguments.
        Args:
            func_name: The name of the function.
            args: Positional arguments.
            kwargs: Keyword arguments.
        Returns:
            str: A hash representing the cache key.
        """
        temp_kwargs = ":".join([str(v) for k, v in kwargs.items() if k not in ["db", "redis", "cache"]])
        return f"{key or func_name}:{temp_kwargs}"
    
    def decorator(func: Callable):
        @wraps(func)
        async def wrapped(*args, **kwargs):
            # Initialize cache service
            cache_service = await get_cache_service()

            # Use the provided key or generate one
            cache_key = generate_cache_key(key=key, func_name=func.__name__, args=args, kwargs=kwargs)

            # Try to get the result from the cache
            cached_result = cache_service.get(cache_key)
            if cached_result is not None:
                return json.loads(cached_result)

            # Compute the result, cache it, and return it
            result = await func(*args, **kwargs)

            if isinstance(result, dict):
                cache_service.set(cache_key, json.dumps(result), expire)
            else:
                cache_service.set(cache_key, result.model_dump_json(), expire)
            return result

        return wrapped

    return decorator
