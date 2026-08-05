from typing import Annotated
from fastapi import Depends, Request
from redis.asyncio import Redis
from arq.connections import ArqRedis
from app.services.cache import CacheService
from app.services.cdn import CdnService


def get_cdn_service(request: Request) -> CdnService:
    return CdnService()

def get_redis_client(request: Request) -> Redis:
    """Extracts the underlying connection pool from app state."""
    return request.app.state.redis

def get_cache_service(request: Request) -> CacheService:
    return CacheService(redis=get_redis_client(request), l1=getattr(request.app.state, "l1_cache", None))

def get_arq_pool(request: Request) -> ArqRedis:
    """Extracts the underlying connection pool from app state."""
    return request.app.state.arq_pool

ArqDep = Annotated[ArqRedis, Depends(get_arq_pool)]
RedisDep = Annotated[Redis, Depends(get_redis_client)]
CacheDep = Annotated[CacheService, Depends(get_cache_service)]
CdnDep = Annotated[CdnService, Depends(get_cdn_service)]