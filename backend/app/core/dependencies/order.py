from typing import Annotated
from fastapi import Depends
from app.services.events import EventBus
from app.core.dependencies.cache import CacheDep
from app.core.dependencies.cart import CartDep
from app.core.dependencies.product import ProductDep
from app.prisma_client import prisma as db
from app.services.coupon import CouponService
from app.repositories.order import OrderRepository
from app.services.order import OrderService
from app.core.notifications.setup import get_notification_service
from app.core.dependencies.services import SettingsDep, get_coupon_service, get_event_bus

def get_order_repository() -> OrderRepository:
    return OrderRepository(db=db)

def get_order_service(cache: CacheDep, cart_srv: CartDep, product_srv: ProductDep, settings_service: SettingsDep, evt_bus: EventBus = Depends(get_event_bus), coupon_srv: CouponService = Depends(get_coupon_service)) -> OrderService:
    return OrderService(
        db=db,
        cart_srv=cart_srv,
        product_srv=product_srv,
        coupon_srv=coupon_srv,
        settings_service=settings_service,
        notification_dispatcher=get_notification_service(),
        event_bus=evt_bus,
        cache=cache
    )

OrderDep = Annotated[OrderService, Depends(get_order_service)]
