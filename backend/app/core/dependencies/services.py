from typing import Annotated
from app.services.chat import ConversationService
from app.services.coupon import CouponService
from app.services.events import EventBus
from app.services.storage import MediaStorageService
from app.services.user_interaction import InteractionService
from fastapi import Depends
from app.prisma_client import prisma as db
from app.redis_client import redis_client
from app.services.gallery import GalleryRepository, GalleryService
from app.services.websocket import manager as ws_manager
from app.services.shop_settings import ShopSettingsService
from app.services.catalog import CatalogService

def get_coupon_service() -> CouponService:
    return CouponService(db=db)

def get_storage_service() -> MediaStorageService:
    return MediaStorageService()

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

def get_shop_settings_service() -> ShopSettingsService:
    return ShopSettingsService(redis=redis_client, db=db)

def get_catalog_service() -> CatalogService:
    return CatalogService(db=db)

def get_conversation_service():
    return ConversationService()


def get_event_bus() -> EventBus:
    return EventBus(redis=redis_client)


def get_interaction_service(evt_bus: EventBus = Depends(get_event_bus)) -> InteractionService:
    return InteractionService(event_bus=evt_bus)


ConversationDep = Annotated[ConversationService, Depends(get_conversation_service)]
SettingsDep = Annotated[ShopSettingsService, Depends(get_shop_settings_service)]