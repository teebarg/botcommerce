from typing import Annotated

from fastapi import Depends

from app.core.dependencies.cache import ArqDep, CacheDep, CdnDep
from app.prisma_client import DbDep
from app.services.categories import CategoryService
from app.services.chat import ConversationService
from app.services.collections import CollectionService
from app.services.coupon import CouponService
from app.services.delivery import DeliveryService
from app.services.review import ReviewService
from app.services.shop_settings import ShopSettingsService
from app.services.storage import MediaStorageService
from app.services.user_interaction import InteractionService


def get_coupon_service(db: DbDep) -> CouponService:
    return CouponService(db=db)

def get_storage_service() -> MediaStorageService:
    return MediaStorageService()

def get_shop_settings_service(db: DbDep, cache_srv: CacheDep, cdn_srv: CdnDep) -> ShopSettingsService:
    return ShopSettingsService(db=db, cache_srv=cache_srv, cdn_srv=cdn_srv)

def get_conversation_service(db: DbDep):
    return ConversationService(db=db)

def get_interaction_service(queue: ArqDep) -> InteractionService:
    return InteractionService(queue=queue)

def get_category_service(cache_srv: CacheDep, cdn_srv: CdnDep) -> CategoryService:
    return CategoryService(cache_srv=cache_srv, cdn_srv=cdn_srv)

def get_collection_service(cache_srv: CacheDep, cdn_srv: CdnDep) -> CollectionService:
    return CollectionService(cache_srv=cache_srv, cdn_srv=cdn_srv)

def get_delivery_service(cache_srv: CacheDep, cdn_srv: CdnDep) -> DeliveryService:
    return DeliveryService(cache_srv=cache_srv, cdn_srv=cdn_srv)

def get_review_service(cache_srv: CacheDep, cdn_srv: CdnDep) -> ReviewService:
    return ReviewService(cache_srv=cache_srv, cdn_srv=cdn_srv)

ConversationDep = Annotated[ConversationService, Depends(get_conversation_service)]
SettingsDep = Annotated[ShopSettingsService, Depends(get_shop_settings_service)]
StorageDep = Annotated[MediaStorageService, Depends(get_storage_service)]
CouponDep = Annotated[CouponService, Depends(get_coupon_service)]
CategoryDep = Annotated[CategoryService, Depends(get_category_service)]
CollectionDep = Annotated[CollectionService, Depends(get_collection_service)]
DeliveryDep = Annotated[DeliveryService, Depends(get_delivery_service)]
ReviewDep = Annotated[ReviewService, Depends(get_review_service)]