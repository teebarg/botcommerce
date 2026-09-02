from typing import Annotated

from fastapi import Depends

from app.core.dependencies.cache import CacheDep
from app.prisma_client import DbDep
from app.services.gallery import GalleryService
from app.services.websocket import manager as ws_manager


def get_gallery_service(cache_srv: CacheDep, db: DbDep) -> GalleryService:
    return GalleryService(
        db=db,
        websocket_manager=ws_manager,
        cache_srv=cache_srv,
    )

GalleryDep = Annotated[GalleryService, Depends(get_gallery_service)]