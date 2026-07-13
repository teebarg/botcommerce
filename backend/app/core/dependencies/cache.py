from typing import Annotated
from fastapi import Depends, Request
from app.redis_client import redis_client
from app.services.cache import CacheService
from app.services.cdn import CdnService

def get_cdn_service(request: Request) -> CdnService:
    return CdnService()

def get_cache_service(request: Request) -> CacheService:
    return CacheService(redis_client=redis_client, l1=getattr(request.app.state, "l1_cache", None))

CacheDep = Annotated[CacheService, Depends(get_cache_service)]
CdnDep = Annotated[CdnService, Depends(get_cdn_service)]