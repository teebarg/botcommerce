from app.db import session_factory
from app.security import call_internal_backend

from core.notifications import Channel, OrderCreated
from core.repositories.order_repository import OrderRepository
from core.repositories.cart_repository import CartRepository
from core.repositories.user_repository import UserRepository
from core.repositories.order_timeline_repository import OrderTimelineRepository
from core.repositories.wallet_txn_repository import WalletTransactionRepository
from core.notifications.events.payment_receipt import PaymentReceipt
from core.notifications.events.referral_cashback import ReferralCashback
from core.db.models.base import CartStatus, OrderStatus

from app.services.generic import build_and_upload_invoice

from core.logging import get_logger

logger = get_logger(__name__)

async def process_referral(ctx, order_id: int) -> dict:
    """
    arq job: referral cashback processing.
    """
    notification_srv = ctx["notification_srv"]
    async with session_factory() as session:
        try:
            order_repo = OrderRepository(session)
            user_repo = UserRepository(session)
            wallet_txn_repo = WalletTransactionRepository(session)
            order = await order_repo.get_by_id(
                id=order_id,
                include={
                    "order_items": True,
                    "user": True,
                },
            )
            if not order:
                logger.error(f"Order not found for ID: {order_id}")
                raise Exception("Order not found")

            if order.status in ["PENDING", "CANCELED", "REFUNDED"]:
                logger.debug("Only paid orders can enjoy referral, skipping")
                return

            if not order.coupon_code:
                logger.debug(f"[process_referral] Order {order.order_number} has no coupon code, skipping")
                return
           
            coupon_owner = await user_repo.get_one(referral_code=order.coupon_code)
            if not coupon_owner:
                logger.debug(f"[process_referral] Coupon owner not found in the system, skipping")
                return

            if coupon_owner.id == order.user_id:
                logger.debug(f"Order {order.order_number} used owner's own referral code — no cashback issued")
                return

            existing = await wallet_txn_repo.get_one(reference_id=order.order_number, type="CASHBACK")
            if existing:
                logger.debug(f"Referral cashback already issued for order {order.order_number}, skipping")
                return

            # result = await wallet_txn_repo.upsert(
            #     create={
            #         "reference_id": order.order_number,
            #         "reference_code": order.coupon_code,
            #         "type": "CASHBACK",
            #         "user_id": coupon_owner.id,
            #         "amount": order.discount_amount,
            #     },
            #     update={},
            #     conflict_columns=["reference_id", "type"],
            # )
            # if result is None:
            #     logger.debug("cashback already credited, skip downstream effects, skipping")
            #     return

            await wallet_txn_repo.create(
                data={
                    "user_id": coupon_owner.id,
                    "amount": order.discount_amount,
                    "reference_code": order.coupon_code,
                    "type": "CASHBACK",
                    "reference_id": order.order_number,
                },
            )

            await user_repo.increment_wallet_balance(coupon_owner.id, order.discount_amount)
            await session.commit()
            await call_internal_backend(path=f"/internal/invalidate", json_body={"tags": [f"wallet:{coupon_owner.id}"]})
        except Exception as e:
            logger.error(f"An error occurred: {e}")
            raise e

    await notification_srv.send(
        ReferralCashback(
            order=order,
            customer_email=coupon_owner.email,
            referral=coupon_owner.first_name
        ),
        channels=[Channel.EMAIL],
    )
    return {"status": "ok"}


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
    return {"status": "ok"}


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
            if not order.invoice_url:
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
    return {"status": "ok"}
