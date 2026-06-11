from app.core.dependencies.services import get_coupon_service, get_shop_settings_service
from app.core.dependencies.cache import CacheDep
from fastapi import Depends
from app.prisma_client import prisma as db
from app.services.shop_settings import ShopSettingsService
from app.services.coupon import CouponService
from app.services.cart import CartRepository, CartService

def get_cart_repository() -> CartRepository:
    return CartRepository(db=db)

def get_cart_service(cache: CacheDep, settings_service: ShopSettingsService = Depends(get_shop_settings_service), coupon_srv: CouponService = Depends(get_coupon_service)) -> CartService:
    return CartService(
        db=db,
        settings_service=settings_service,
        coupon_service=coupon_srv,
        cache=cache
    )