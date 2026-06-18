from typing import Annotated
from fastapi import Depends
from app.prisma_client import prisma as db
from app.services.cart import CartService
from app.core.dependencies.services import CouponDep
from app.core.dependencies.cache import CacheDep
from app.core.dependencies.services import SettingsDep

def get_cart_service(cache_srv: CacheDep, coupon_srv: CouponDep, settings_srv: SettingsDep) -> CartService:
    return CartService(
        db=db,
        settings_srv=settings_srv,
        coupon_srv=coupon_srv,
        cache_srv=cache_srv
    )

CartDep = Annotated[CartService, Depends(get_cart_service)]