from typing import Annotated
from fastapi import Request, Depends
from app.redis_client import redis_client
from app.services.cache import CacheService

def get_cache_service() -> CacheService:
    return CacheService(redis_client=redis_client)


CacheDep = Annotated[CacheService, Depends(get_cache_service)]