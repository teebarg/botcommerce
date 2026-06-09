from fastapi import Depends
from app.prisma_client import prisma as db
from app.services.shop_settings import ShopSettingsService
from app.services.coupon import CouponService
from app.services.cart import CartRepository, CartService

def get_cart_repository() -> CartRepository:
    return CartRepository(db=db)

def get_cart_service() -> CartService:
    return CartService(
        db=db,
        settings_service=ShopSettingsService(),
        coupon_service=CouponService()
    )