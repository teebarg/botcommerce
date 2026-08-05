from typing import Annotated
from fastapi import Depends, Request
from redis.asyncio import Redis


def get_redis_client(request: Request) -> Redis:
    """Extracts the underlying connection pool from app state."""
    return request.app.state.redis

RedisDep = Annotated[Redis, Depends(get_redis_client)]
