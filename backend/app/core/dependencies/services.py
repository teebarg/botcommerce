from typing import Annotated
from fastapi import Depends
from app.prisma_client import prisma as db
from app.redis_client import redis_client
from app.services.gallery import GalleryRepository, GalleryService
from app.services.websocket import manager as ws_manager
from app.services.recently_viewed import RecentlyViewedService
from app.services.shop_settings import ShopSettingsService

def get_gallery_repository() -> GalleryRepository:
    return GalleryRepository(db=db)

def get_gallery_service(
    repo: GalleryRepository = Depends(get_gallery_repository)
) -> GalleryService:
    return GalleryService(
        repo=repo,
        db=db,
        websocket_manager=ws_manager,
        recently_viewed_service=RecentlyViewedService()
    )

def get_shop_settings_service() -> ShopSettingsService:
    return ShopSettingsService(redis=redis_client, db=db)
