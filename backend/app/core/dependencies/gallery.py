from typing import Annotated
from fastapi import Depends
from app.prisma_client import prisma as db
from app.services.gallery import GalleryService
from app.services.websocket import manager as ws_manager
from app.core.dependencies.services import StorageDep

def get_gallery_service(storage_srv: StorageDep) -> GalleryService:
    return GalleryService(
        db=db,
        websocket_manager=ws_manager,
        storage_srv=storage_srv
    )

GalleryDep = Annotated[GalleryService, Depends(get_gallery_service)]