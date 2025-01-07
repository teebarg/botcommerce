from fastapi import  HTTPException
from functools import wraps
from typing import Optional
import re

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