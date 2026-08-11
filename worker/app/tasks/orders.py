import os
from app.db import session_factory
from app.security import call_internal_backend

from core.notifications import Channel, OrderCreated
from core.repositories.order_repository import OrderRepository
from core.repositories.cart_repository import CartRepository
from core.repositories.order_timeline_repository import OrderTimelineRepository
from core.notifications.events.payment_receipt import PaymentReceipt
from core.db.models.base import CartStatus, OrderStatus

from app.services.generic import build_and_upload_invoice

from core.logging import get_logger

logger = get_logger(__name__)

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


async def order_created(ctx, order_id: int) -> dict:
    notification_srv = ctx["notification_srv"]
    async with session_factory() as session:
        try:
            order_repo = OrderRepository(session)
            cart_repo = CartRepository(session)
            order_timeline_repo = OrderTimelineRepository(session)
            order = await order_repo.get_by_id(
                id=order_id,
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

            await order_timeline_repo.create(
                data={
                    "order_id": order.id,
                    "message": f"order {order.order_number} created",
                    "from_status": OrderStatus.PENDING,
                    "to_status": OrderStatus.PENDING,
                },
            )

            await cart_repo.update(order.cart_id, {"status": CartStatus.CONVERTED})
            await session.commit()
        except Exception as e:
            logger.error(f"An error occurred: {e}")
            raise

    await notification_srv.send(
        OrderCreated(
            order=order,
            customer_email=order.user.email,
            first_name=order.user.first_name,
            last_name=order.user.last_name,
            total=order.total
        ),
        channels=[
            Channel.EMAIL,
            Channel.SLACK
        ],
    )


async def generate_and_send_invoice(ctx, order_id: int) -> dict:
    notification_srv = ctx["notification_srv"]
    async with session_factory() as session:
        try:
            order_repo = OrderRepository(session)
            order = await order_repo.get_by_id(
                id=order_id,
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
            if not order:
                logger.error(f"Order not found for ID: {order_id}")
                raise Exception("Order not found")
            print(order.invoice_url)
            if not order.invoice_url:
                print("no url generating one")
                public_url = await build_and_upload_invoice(ctx, order)
                await order_repo.update(order_id, {"invoice_url": public_url})
                await session.commit()
        except Exception as e:
            logger.error(f"An error occurred: {e}")
            raise e

    await notification_srv.send(
        PaymentReceipt(
            order=order,
            customer_email=order.user.email,
            first_name=order.user.first_name,
        ),
        channels=[Channel.EMAIL],
    )
