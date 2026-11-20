from typing import Annotated

from fastapi import Depends

from app.core.dependencies.cache import CacheDep, CdnDep
from app.core.dependencies.product import ProductDep
from app.prisma_client import DbDep
from app.services.album import AlbumService


def get_album_service(
    db: DbDep,
    product_srv: ProductDep,
    cache_srv: CacheDep,
    cdn_srv: CdnDep,
) -> AlbumService:
    return AlbumService(
        db=db, product_srv=product_srv, cache_srv=cache_srv, cdn_srv=cdn_srv
    )


AlbumDep = Annotated[AlbumService, Depends(get_album_service)]