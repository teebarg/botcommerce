from typing import Annotated

from fastapi import Depends

from app.core.dependencies.cache import ArqDep, CacheDep
from app.core.dependencies.cart import CartDep
from app.core.dependencies.product import ProductDep
from app.core.dependencies.services import CouponDep, SettingsDep
from app.prisma_client import DbDep
from app.services.order import OrderService
from app.services.payment import PaymentService


def get_payment_service(db: DbDep, queue: ArqDep) -> PaymentService:
    return PaymentService(db=db, queue=queue)

PaymentDep = Annotated[PaymentService, Depends(get_payment_service)]

def get_order_service(
    queue: ArqDep,
    db: DbDep,
    cache_srv: CacheDep,
    cart_srv: CartDep,
    coupon_srv: CouponDep,
    product_srv: ProductDep,
    settings_srv: SettingsDep,
    payment_srv: PaymentDep,
    ) -> OrderService:
    return OrderService(
        db=db,
        cart_srv=cart_srv,
        product_srv=product_srv,
        coupon_srv=coupon_srv,
        settings_srv=settings_srv,
        cache_srv=cache_srv,
        queue=queue,
        payment_srv=payment_srv
    )

OrderDep = Annotated[OrderService, Depends(get_order_service)]
