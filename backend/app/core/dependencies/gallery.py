from typing import Annotated
from fastapi import Depends
from app.services.gallery import GalleryService
from app.services.websocket import manager as ws_manager
from app.core.dependencies.services import StorageDep
from app.core.dependencies.cache import CacheDep
from app.core.deps import DbDep

def get_gallery_service(cache_srv: CacheDep, db: DbDep, storage_srv: StorageDep) -> GalleryService:
    return GalleryService(
        db=db,
        websocket_manager=ws_manager,
        cache_srv=cache_srv,
        storage_srv=storage_srv
    )

GalleryDep = Annotated[GalleryService, Depends(get_gallery_service)]