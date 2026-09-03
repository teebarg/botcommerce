from typing import Annotated

from fastapi import Depends

from app.core.dependencies.cache import CacheDep, CdnDep
from app.core.search.meilisearch import MeilisearchEngine
from app.prisma_client import DbDep
from app.services.product import ProductService
from app.services.search import SearchService


def get_search_service() -> SearchService:
    return SearchService()

def get_search_engine() -> MeilisearchEngine:
    return MeilisearchEngine()

def get_product_service(
    db: DbDep,
    cache_srv: CacheDep,
    cdn_srv: CdnDep,
    search_srv: SearchService = Depends(get_search_service),
    search_engine: MeilisearchEngine = Depends(get_search_engine)
) -> ProductService:
    return ProductService(db=db, search_srv=search_srv, cache_srv=cache_srv, cdn_srv=cdn_srv, search_engine=search_engine)

ProductDep = Annotated[ProductService, Depends(get_product_service)]
SearchDep = Annotated[SearchService, Depends(get_search_service)]
