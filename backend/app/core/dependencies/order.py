from typing import Annotated
from app.services.events import EventBus
from app.core.dependencies.cache import CacheDep
from fastapi import Depends, Request
from app.prisma_client import prisma as db
from app.services.coupon import CouponService
from app.repositories.order import OrderRepository
from app.services.order import OrderService
from app.core.notifications.setup import get_notification_service
from app.core.dependencies.services import SettingsDep, get_coupon_service, get_event_bus

def get_order_repository() -> OrderRepository:
    return OrderRepository(db=db)

def get_order_service(cache: CacheDep, settings_service: SettingsDep, evt_bus: EventBus = Depends(get_event_bus), coupon_srv: CouponService = Depends(get_coupon_service)) -> OrderService:
    return OrderService(
        db=db,
        coupon_service=coupon_srv,
        settings_service=settings_service,
        notification_dispatcher=get_notification_service(),
        event_bus=evt_bus,
        cache=cache
    )

OrderDep = Annotated[OrderService, Depends(get_order_service)]
