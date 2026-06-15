from typing import Annotated
from app.services.storage import MediaStorageService
from app.core.dependencies.services import get_storage_service
from fastapi import Depends
from app.prisma_client import prisma as db
from app.services.gallery import GalleryRepository, GalleryService
from app.services.websocket import manager as ws_manager

def get_gallery_repository() -> GalleryRepository:
    return GalleryRepository(db=db)

def get_gallery_service(
    repo: GalleryRepository = Depends(get_gallery_repository),
    storage_srv: MediaStorageService = Depends(get_storage_service)
) -> GalleryService:
    return GalleryService(
        repo=repo,
        db=db,
        websocket_manager=ws_manager,
        storage_srv=storage_srv
    )

GalleryDep = Annotated[GalleryService, Depends(get_gallery_service)]