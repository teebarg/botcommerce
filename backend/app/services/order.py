from typing import Optional
import uuid
from fastapi import HTTPException
from app.prisma_client import prisma as db
from app.models.order import OrderResponse, OrderCreate
from app.core.utils import generate_invoice_email
from app.core.logging import logger
from app.services.invoice import invoice_service

from datetime import datetime
from app.core.deps import (
    supabase
)
from app.services.product import index_products
from app.services.redis import CacheService
from app.core.config import settings


async def create_order_from_cart(order_in: OrderCreate, user_id: int, cart_number: str) -> OrderResponse:
    """
    Create a new order from a cart
    """
    order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"

    cart = await db.cart.find_unique(
        where={"cart_number": cart_number},
        include={"items": True}
    )
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    data = {
            "order_number": order_number,
            "email": cart.email,
            "total": cart.total,
            "subtotal": cart.subtotal,
            "tax": cart.tax,
            "shipping_fee": cart.shipping_fee,
            "status": order_in.status,
            "payment_status": order_in.payment_status,
            "shipping_method": cart.shipping_method,
            "payment_method": cart.payment_method,
            "cart": {"connect": {"id": cart.id}},
            "user": {"connect": {"id": user_id}},
            "order_items": {
                "create": [
                    {
                        "name": item.name,
                        "image": item.image,
                        "variant": {"connect": {"id": item.variant_id}},
                        "quantity": item.quantity,
                        "price": item.price
                    } for item in cart.items
                ]
            }
        }

    if cart.shipping_address_id:
        data["shipping_address"] = {"connect": {"id": cart.shipping_address_id}}

    new_order = await db.order.create(
        data=data
    )

    return new_order

async def retrieve_order(order_id: str) -> OrderResponse:
    """
    Get a specific order by order_number
    """
    order = await db.order.find_unique(
        where={"order_number": order_id},
        include={
            "order_items": {
                "include": {
                    "variant": True,
                }
            },
            "user": True,
            "shipping_address": True
        },
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

async def list_orders(
    user_id: int,
    skip: int = 0,
    take: int = 20,
    status: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    customer_id: Optional[int] = None,
    user_role: str = "CUSTOMER",
    sort: Optional[str] = "desc"
):
    """
    List orders with filtering and pagination
    """
    where = {}
    if status:
        where["status"] = status
    if customer_id:
        where["user_id"] = customer_id
    if search:
        where["order_number"] = search
    if user_role == "CUSTOMER":
        where["user_id"] = user_id
    if start_date:
        where["created_at"] = {"gte": start_date}
    if end_date:
        where["created_at"] = {"lte": end_date}

    orders = await db.order.find_many(
        where=where,
        skip=skip,
        take=take,
        order={"created_at": sort},
        include={
            "order_items": {
                "include": {
                    "variant": True,
                }
            },
            "user": True,
            "shipping_address": True,
        }
    )
    total = await db.order.count(where=where)
    return {
        "orders": orders,
        "page": skip,
        "limit": take,
        "total_pages": (total + take - 1) // take,
        "total_count": total,
    }


async def send_notification(id: int, user_id: int, notification):
    try:
        user = await db.user.find_unique(where={"id": user_id})
        if not user:
            logger.error(f"User not found for ID: {user_id}")
            return

        order = await db.order.find_unique(
            where={"id": id},
            include={
                "order_items": {
                    "include": {
                        "variant": True,
                    }
                },
                "user": True,
                "shipping_address": True
            }
        )

        try:
            email_data = await generate_invoice_email(order=order, user=user)
            notification.send_notification(
                channel_name="email",
                recipient=user.email,
                subject=email_data.subject,
                message=email_data.html_content
            )
            logger.info(f"Invoice email sent to user: {user_id}")
        except Exception as e:
            logger.error(f"Failed to generate invoice email: {e}")
            return

        order_link = f"{settings.FRONTEND_HOST}/order/confirmed/{order.order_number}"
        items_overview = "\n".join(
            [f"• {it.name} x{it.quantity} - {it.price}" for it in (order.order_items or [])]
        ) or "No items found"

        slack_message = {
            "text": (
                f"🛍️ *New Order Created* 🛍️\n"
                f"*Order:* <{order_link}|{order.order_number}>\n"
                f"*Customer:* {user.first_name} {user.last_name}\n"
                f"*Email:* {user.email}\n"
                f"*Amount:* {order.total}\n"
                f"*Payment Status:* {order.payment_status}\n"
                f"*Items:*\n{items_overview}\n"
            )
        }

        notification.send_notification(
            channel_name="slack",
            slack_message=slack_message
        )
        logger.info(f"Slack notification sent to user: {user_id}")

        try:
            contact = await db.shopsettings.find_unique(
                where={"key": "whatsapp"}
            )
            whatsapp_available = hasattr(notification, "channels") and "whatsapp" in getattr(notification, "channels", {})
            if contact and whatsapp_available:
                normalized = contact.value.replace(" ", "").replace("+", "")
                whatsapp_text = (
                    f"New order: {order.order_number}\n"
                    f"Customer: {user.first_name} {user.last_name}\n"
                    f"Email: {user.email}\n"
                    f"Amount: {order.total}\n"
                    f"Payment: {order.payment_status}\n"
                    f"Items:\n{items_overview}\n\n"
                    f"View order: {order_link}\n"
                )
                notification.send_notification(
                    channel_name="whatsapp",
                    recipient=normalized,
                    message=whatsapp_text,
                )
                logger.info("WhatsApp notification sent to shop contact")
            else:
                logger.info("WhatsApp not configured or shop contact missing. Skipping WhatsApp notification.")
        except Exception as e:
            logger.error(f"Failed to send WhatsApp notification: {e}")
    except Exception as e:
        logger.error(f"Failed to send notification: {e}")


async def create_invoice(cache, order_id: int) -> str:
    """Generate and upload invoice PDF to Supabase storage, returning the download URL"""
    try:
        order = await db.order.find_unique(where={"id": order_id}, include={"order_items": True, "user": True, "shipping_address": True})
        if not order:
            logger.error(f"Order not found for ID: {order_id}")
            raise HTTPException(status_code=404, detail="Order not found")
        settings = await db.shopsettings.find_many()
        settings_dict = {setting.key: setting.value for setting in settings}

        pdf_bytes = invoice_service.generate_invoice_pdf(order=order, company_info=settings_dict)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"invoice_{order.order_number}_{timestamp}_{uuid.uuid4().hex[:8]}.pdf"

        try:
            result = supabase.storage.from_("invoices").upload(filename, pdf_bytes, {
                "contentType": "application/pdf"
            })

            if not result:
                raise HTTPException(status_code=500, detail="Failed to upload invoice to storage")
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=500, detail="Failed to upload invoice to storage.")

        public_url = supabase.storage.from_("invoices").get_public_url(filename, {"download": filename})

        await db.order.update(
            where={"id": order_id},
            data={"invoice_url": public_url}
        )

        await cache.invalidate_list_cache("orders")
        await cache.bust_tag(f"order:{order_id}")

        return public_url
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in download_invoice: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred while generating the invoice")


async def decrement_variant_inventory_for_order(order_id: int, notification=None, cache: CacheService = None):
    """
    Decrement inventory for each variant in the order. If inventory reaches 0, set status to OUT_OF_STOCK and send notification.
    """
    order = await db.order.find_unique(
        where={"id": order_id},
        include={"order_items": {"include": {"variant": True}}}
    )
    if not order:
        logger.error(f"Order not found for ID: {order_id}")
        raise HTTPException(status_code=404, detail="Order not found")

    out_of_stock_variants = []

    async with db.tx() as tx:
        try:
            for item in order.order_items:
                variant_id = item.variant_id
                quantity = item.quantity
                variant = await tx.productvariant.find_unique(where={"id": variant_id})
                if not variant:
                    logger.info(f"Variant {variant_id} not found for order {order_id}")
                    continue
                new_inventory = max(0, variant.inventory - quantity)
                update_data = {"inventory": new_inventory}
                out_of_stock = False
                if new_inventory == 0 and variant.status != "OUT_OF_STOCK":
                    update_data["status"] = "OUT_OF_STOCK"
                    out_of_stock = True
                await tx.productvariant.update(where={"id": variant_id}, data=update_data)
                # if cache:
                #     await reindex_product(cache=cache, product_id=variant.product_id)
                if out_of_stock:
                    out_of_stock_variants.append(variant)
        except Exception as e:
            logger.error(f"Failed to decrement variant inventory for order {order_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to decrement variant inventory for order")

    if cache:
        await index_products(cache=cache)

    if out_of_stock_variants and notification:
        subject = f"Product Variants OUT OF STOCK in Order {order_id}"
        message_lines = [
            f"The following product variants are now OUT OF STOCK due to order {order_id}:"
        ]
        for v in out_of_stock_variants:
            message_lines.append(f"- SKU: {v.sku}, Product ID: {v.product_id}")
        message = "\n".join(message_lines)
        try:
            notification.send_notification(
                channel_name="email",
                recipient="teebarg01@gmail.com",
                subject=subject,
                message=message
            )
        except Exception as e:
            logger.error(f"Failed to send out-of-stock email: {e}")
        try:
            slack_text = f"🚨 *OUT OF STOCK* 🚨\nOrder ID: {order_id}\n" + "\n".join([
                f"• SKU: {v.sku}, Product ID: {v.product_id}" for v in out_of_stock_variants
            ])
            notification.send_notification(
                channel_name="slack",
                slack_message={"text": slack_text}
            )
        except Exception as e:
            logger.error(f"Failed to send out-of-stock slack: {e}")
