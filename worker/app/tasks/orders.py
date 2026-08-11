from core.utils import format_naira
from core.utils import format_date
from core.notifications.events.payment_receipt import PaymentReceipt
import os
import uuid
from datetime import datetime
from app.services.pdf import generate_pdf_invoice
from app.db import session_factory
from app.security import call_internal_backend

from core.notifications import Channel, OrderCreated
from core.repositories.order_repository import OrderRepository
from core.repositories.cart_repository import CartRepository
from core.repositories.order_timeline_repository import OrderTimelineRepository

from core.db.models.base import CartStatus, OrderStatus
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
    settings = ctx["settings"]
    storage = ctx["storage"]
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
            sample_payload = {
                "company_name": settings.get("shop_name"),
                "company_address2": f"ShopCore Fulfillment Ltd<br/>100 Tech Runway, Suite 400<br/>Austin, TX 78701",
                "company_address": f"{settings.get('shop_name')}<br/>{settings.get('address')}",
                "invoice_no": order.order_number,
                "date": format_date(order.created_at),
                "order_id": order.order_number,
                "customer_name": f"{order.user.first_name} {order.user.last_name}",
                "customer_address": f"{order.shipping_address.address_1}<br/>{order.shipping_address.city}, {order.shipping_address.state}",
                # "items": [
                #     {"name": "Quantum Wireless Earbuds (Gen 3)", "qty": 1, "price": 129.99},
                #     {"name": "Ultra-Thin MagSafe Power Bank 10k", "qty": 2, "price": 45.00},
                #     {"name": "Braided USB-C Fast Charging Cable (2m)", "qty": 1, "price": 19.99}
                # ],
                "items": [{"name": item.name, "qty": item.quantity, "price": format_naira(item.variant.price), "total": format_naira(item.quantity * item.variant.price)} for item in order.order_items],
                "subtotal": format_naira(order.subtotal),
                "tax": format_naira(order.tax),
                "total": format_naira(order.total),
            }

            # pdf_bytes = generate_pdf_invoice(sample_payload, "invoice.pdf")
            output_path = f"/tmp/{sample_payload['invoice_no']}.pdf"
            generate_pdf_invoice(sample_payload, output_path)
            with open(output_path, "rb") as f:
                pdf_bytes = f.read()
            timestamp: str = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename: str = f"invoices/invoice_{order.order_number}_{timestamp}_{uuid.uuid4().hex[:8]}.pdf"

            result = storage.upload_file(
                filename=filename,
                bytes_data=pdf_bytes,
                content_type="application/pdf"
            )
            if not result:
                raise Exception("Failed to upload invoice to storage")
            public_url = storage.get_public_url(filename=filename)
            await order_repo.update(order_id, {"invoice_url": public_url})
            await session.commit()
        except Exception as e:
            logger(f"An error occurred: {e}")
            raise e
        finally:
            if output_path and os.path.exists(output_path):
                os.remove(output_path)


    await notification_srv.send(
        PaymentReceipt(
            order=order,
            customer_email=order.user.email,
        ),
        channels=[Channel.EMAIL],
    )
