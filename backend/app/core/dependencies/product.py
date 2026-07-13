from typing import Annotated
from fastapi import Depends
from app.prisma_client import prisma as db
from app.redis_client import redis_client
from app.services.product import ProductService
from app.core.dependencies.cache import CacheDep, CdnDep
from app.services.search import SearchService

def get_search_service() -> SearchService:
    return SearchService()

def get_product_service(
    cache_srv: CacheDep,
    cdn_srv: CdnDep,
    search_srv: SearchService = Depends(get_search_service)
) -> ProductService:
    return ProductService(db=db, redis=redis_client, search_srv=search_srv, cache_srv=cache_srv, cdn_srv=cdn_srv)

ProductDep = Annotated[ProductService, Depends(get_product_service)]
SearchDep = Annotated[SearchService, Depends(get_search_service)]