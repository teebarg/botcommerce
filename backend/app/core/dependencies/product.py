from app.core.dependencies.services import get_cache_service
from backend.app.services.cache import CacheService
from fastapi import Depends, Request
from app.prisma_client import prisma as db
from app.services.product import ProductRepository, SearchRepository, ProductService

def get_product_repository(request: Request) -> ProductRepository:
    # Safely extraction of configured redis engine state
    redis = getattr(request.app.state, "redis", None)
    return ProductRepository(db=db, redis=redis)

def get_search_repository() -> SearchRepository:
    return SearchRepository()

def get_product_service(
    repo: ProductRepository = Depends(get_product_repository),
    search_repo: SearchRepository = Depends(get_search_repository),
    cache_service: CacheService = Depends(get_cache_service)
) -> ProductService:
    return ProductService(repo=repo, search_repo=search_repo, cache_service=cache_service)