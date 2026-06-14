from typing import Annotated
from fastapi import Depends
from app.prisma_client import prisma as db
from app.redis_client import redis_client
from app.services.product import SearchRepository, ProductService
from app.core.dependencies.cache import CacheDep

def get_search_repository() -> SearchRepository:
    return SearchRepository()

def get_product_service(
    cache_srv: CacheDep,
    search_repo: SearchRepository = Depends(get_search_repository)
) -> ProductService:
    return ProductService(db=db, redis=redis_client, search_repo=search_repo, cache_srv=cache_srv)

ProductDep = Annotated[ProductService, Depends(get_product_service)]