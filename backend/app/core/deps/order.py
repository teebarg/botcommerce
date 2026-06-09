from fastapi import Depends
from app.prisma_client import prisma as db
from app.core.deps import Notification
from app.services.coupon import CouponService
from app.services.shop_settings import ShopSettingsService
from app.repositories.order import OrderRepository
from app.services.order import OrderService

def get_order_repository() -> OrderRepository:
    return OrderRepository(db=db)

def get_order_service() -> OrderService:
    return OrderService(
        db=db,
        coupon_service=CouponService(),
        settings_service=ShopSettingsService(),
        notification_dispatcher=Notification()
    )
    