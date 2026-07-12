from typing import Annotated
from app.services.chat import ConversationService
from app.services.coupon import CouponService
from app.services.events import EventBus
from app.services.storage import MediaStorageService
from app.services.user_interaction import InteractionService
from app.core.dependencies.cache import CacheDep
from fastapi import Depends
from app.prisma_client import prisma as db
from app.redis_client import redis_client
from app.services.bank_details import BankDetailsService
from app.services.shop_settings import ShopSettingsService
from app.services.catalog import CatalogService
from app.services.categories import CategoryService
from app.services.collections import CollectionService

def get_coupon_service() -> CouponService:
    return CouponService(db=db)

def get_storage_service() -> MediaStorageService:
    return MediaStorageService()

def get_shop_settings_service() -> ShopSettingsService:
    return ShopSettingsService(redis=redis_client, db=db)

def get_catalog_service(cache_srv: CacheDep) -> CatalogService:
    return CatalogService(db=db, cache_srv=cache_srv)

def get_conversation_service():
    return ConversationService()

def get_event_bus() -> EventBus:
    return EventBus(redis=redis_client)

def get_interaction_service(evt_bus: EventBus = Depends(get_event_bus)) -> InteractionService:
    return InteractionService(event_bus=evt_bus)

def get_category_service(cache_srv: CacheDep) -> CategoryService:
    return CategoryService(cache_srv=cache_srv)

def get_collection_service(cache_srv: CacheDep) -> CollectionService:
    return CollectionService(cache_srv=cache_srv)

def get_bank_details_service(cache_srv: CacheDep) -> BankDetailsService:
    return BankDetailsService(cache_srv=cache_srv)

ConversationDep = Annotated[ConversationService, Depends(get_conversation_service)]
SettingsDep = Annotated[ShopSettingsService, Depends(get_shop_settings_service)]
CatalogDep = Annotated[CatalogService, Depends(get_catalog_service)]
StorageDep = Annotated[MediaStorageService, Depends(get_storage_service)]
CouponDep = Annotated[CouponService, Depends(get_coupon_service)]
CategoryDep = Annotated[CategoryService, Depends(get_category_service)]
CollectionDep = Annotated[CollectionService, Depends(get_collection_service)]
BankDetailsDep = Annotated[BankDetailsService, Depends(get_bank_details_service)]