from app.services.events import EventBus
from fastapi import Depends, Request
from app.core.deps import SettingsDep
from app.prisma_client import prisma as db
from app.services.coupon import CouponService
from app.repositories.order import OrderRepository
from app.services.order import OrderService
from app.core.notifications.setup import get_notification_service
from app.core.dependencies.services import get_event_bus

def get_order_repository() -> OrderRepository:
    return OrderRepository(db=db)

def get_order_service(settings_service: SettingsDep, evt_bus: EventBus = Depends(get_event_bus)) -> OrderService:
    return OrderService(
        db=db,
        coupon_service=CouponService(),
        settings_service=settings_service,
        notification_dispatcher=get_notification_service(),
        event_bus=evt_bus
    )
