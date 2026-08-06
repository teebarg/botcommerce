from typing import Annotated
from fastapi import Depends
from app.services.cart import CartService
from app.core.dependencies.services import CouponDep, SettingsDep
from app.core.dependencies.cache import CacheDep
from app.core.deps import DbDep

def get_cart_service(cache_srv: CacheDep, db: DbDep, coupon_srv: CouponDep, settings_srv: SettingsDep) -> CartService:
    return CartService(
        db=db,
        settings_srv=settings_srv,
        coupon_srv=coupon_srv,
        cache_srv=cache_srv
    )

CartDep = Annotated[CartService, Depends(get_cart_service)]