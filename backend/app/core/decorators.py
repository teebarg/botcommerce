import re
from collections.abc import Callable
from functools import wraps

from fastapi import HTTPException

import time
from typing import Callable, TypeVar, ParamSpec

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

    time_periods = {
        "second": 1,
        "minute": 60,
        "hour": 3600,
        "day": 86400
    }

    if period not in time_periods and period + "s" not in time_periods:
        raise ValueError(f"Invalid time period. Must be one of: {', '.join(time_periods.keys())}")

    period_seconds = time_periods.get(period) or time_periods.get(period[:-1])

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request: Request = kwargs["request"]
            if not request:
                raise ValueError("FastAPI Request not found")

            cache = request.app.state.redis
            client_ip = request.client.host
            key = f"rate_limit:{client_ip}:{func.__name__}"

            current_count = await cache.incr(key)

            if current_count == 1:
                await cache.expire(key, period_seconds)

            if current_count > max_requests:
                raise HTTPException(
                    status_code=429,
                    detail=f"Rate limit exceeded. Maximum {max_requests} requests per {period} allowed."
                )

            return await func(*args, **kwargs)
        return wrapper
    return decorator

def with_retry(
    retries: int = 3,
    delay: float = 1.0,
    backoff: float = 2.0,
    exceptions: tuple = ()
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

            raise last_exception
        return wrapper
    return decorator
