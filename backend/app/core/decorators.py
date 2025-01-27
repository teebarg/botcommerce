import hashlib
import json
import re
from collections.abc import Callable
from functools import wraps

from fastapi import HTTPException

from app.services.cache import get_cache_service
import time
from typing import Generator, Callable, TypeVar, ParamSpec
from sqlalchemy.exc import OperationalError, DBAPIError
import logging

# Type variables for generic function signatures
T = TypeVar('T')
P = ParamSpec('P')


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
            cache = await get_cache_service()
            # Extract request
            # request = kwargs.get("request")

            # if not request:
            #     raise ValueError("Rate limiting requires 'request' parameter")
            
            # client_ip = request.state.client_host

            # client_ip = request.client.host
            # key = f"rate_limit:{client_ip}:{func.__name__}"
            key = f"rate_limit:{func.__name__}"

            # Increment the request count
            current_count = cache.redis.incr(key)

            if current_count == 1:
                # Set the expiration for the first request
                cache.redis.expire(key, period_seconds)

            if current_count > max_requests:
                raise HTTPException(
                    status_code=429,
                    detail=f"Rate limit exceeded. Maximum {max_requests} requests per {period} allowed."
                )

            return await func(*args, **kwargs)
        return wrapper
    return decorator


def cache(expire: int = 86400, key: str | None = None, hash: bool = True):
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
        temp_kwargs = ":".join([str(v.id) if k == "user" else str(v) for k, v in kwargs.items() if k not in ["db", "redis", "cache", "cart_in"]])
        if hash:
            temp_kwargs = hashlib.sha256(temp_kwargs.encode()).hexdigest()

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

            try:
                if isinstance(result, dict):
                    serialized_result = json.dumps(result)
                elif hasattr(result, "model_dump_json"):
                    serialized_result = result.model_dump_json()  # For Pydantic v2.x
                elif hasattr(result, "json"):
                    serialized_result = result.json()  # For Pydantic v1.x
                else:
                    raise Exception("Cannot serialize result")
                cache_service.set(cache_key, serialized_result, expire)
            except Exception as e:
                raise ValueError(f"Failed to serialize result: {e}")
            return result

        return wrapped

    return decorator


def with_retry(
    retries: int = 3,
    delay: float = 1.0,
    backoff: float = 2.0,
    exceptions: tuple = (OperationalError, DBAPIError)
) -> Callable[[Callable[P, T]], Callable[P, T]]:
    """
    Decorator that implements retry logic for database operations.
    
    Args:
        retries: Number of retries before giving up
        delay: Initial delay between retries in seconds
        backoff: Multiplier applied to delay between retries
        exceptions: Tuple of exceptions to catch and retry on
    """
    def decorator(func: Callable[P, T]) -> Callable[P, T]:
        @wraps(func)
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            last_exception = None
            current_delay = delay

            for attempt in range(retries + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt == retries:
                        logging.error(f"Failed after {retries} retries: {str(e)}")
                        raise
                    
                    logging.warning(
                        f"Database operation failed (attempt {attempt + 1}/{retries + 1}): {str(e)}"
                        f"\nRetrying in {current_delay} seconds..."
                    )
                    
                    time.sleep(current_delay)
                    current_delay *= backoff
            
            raise last_exception  # This line should never be reached
        return wrapper
    return decorator
