from app.security import call_internal_backend
from core.notifications import Channel, TestCreated, Welcome, OrderCreated
from core.repositories.coupon_repository import CouponRepository
from core.repositories.user_repository import UserRepository
from core.logging import get_logger
from app.db import session_factory
from core.notifications import Channel, TestCreated, Welcome
from core.repositories.coupon_repository import CouponRepository
from core.repositories.user_repository import UserRepository
from core.repositories.order_repository import OrderRepository
from core.logging import get_logger

async def order_created(ctx, order_id: int) -> dict:
    """
    arq job: delegates referral order creation side effects to the backend's
    internal endpoint.
    """
    return await call_internal_backend(
        path=f"/internal/orders/{order_id}/process-created",
        label=f"Order creation pipeline for {order_id}",
    )

async def process_referral(ctx, order_id: int) -> dict:
    """
    arq job: delegates referral cashback processing to the backend's
    internal endpoint. Idempotent on the backend side (self-referral guard
    + existing-wallet-transaction check), so safe to retry.
    """
    return await call_internal_backend(
        path=f"/internal/orders/{order_id}/process-referral",
        label=f"Referral processing for order {order_id}",
    )

async def generate_and_send_invoice(ctx, order_number: str) -> dict:
    notification_srv = ctx["notification_srv"]

    async with session_factory() as session:
        order_repo = OrderRepository(session)
        order = await order_repo.get_by_order_number(
            order_number=order_number,
            include={
                "order_items": {
                    "include": {
                        "variant": True,
                    }
                },
                "user": True,
                "shipping_address": True,
            },
        )

    await notification_srv.send(
        OrderCreated(
            order=order,
            customer_email="teebarg01@gmail.com",
            first_name=order.user.first_name,
            last_name=order.user.last_name,
            total=10000
        ),
        channels=[
            Channel.EMAIL,
            Channel.SLACK
        ],
    )
