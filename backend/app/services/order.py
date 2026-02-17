from typing import Optional
import uuid
from fastapi import HTTPException, BackgroundTasks
from app.prisma_client import prisma as db
from app.models.order import Order, OrderCreate
from app.core.utils import generate_invoice_email, generate_payment_receipt
from app.core.logging import logger
from app.services.invoice import invoice_service
from prisma.enums import CartStatus
from datetime import datetime
from app.core.deps import supabase, Notification
from app.services.product import reindex_product
from app.core.config import settings
from app.services.events import publish_order_event
from app.services.redis import invalidate_key, invalidate_pattern
from app.services.shop_settings import ShopSettingsService

async def get_cart(cart_number: Optional[str], user_id: Optional[str]):
    """Retrieve an existing cart or create a new one if it doesn't exist"""
    if user_id:
        cart = await db.cart.find_first(
            where={"user_id": user_id, "status": CartStatus.ACTIVE},
            include={"items": True},
            order={"created_at": "desc"}
        )
        if cart:
            return cart

    if cart_number:
        cart = await db.cart.find_unique(where={"cart_number": cart_number}, include={"items": True})
        if cart:
            return cart

async def create_order_from_cart(order_in: OrderCreate, user_id: int, cart_number: str) -> Order:
    """
    Create a new order from a cart
    """
    order_number = f"ORD{uuid.uuid4().hex[:8].upper()}"
    cart = await get_cart(cart_number=cart_number, user_id=user_id)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    data = {
            "order_number": order_number,
            "email": cart.email,
            "phone": cart.phone,
            "total": cart.total,
            "subtotal": cart.subtotal,
            "tax": cart.tax,
            "shipping_fee": cart.shipping_fee,
            "discount_amount": cart.discount_amount,
            "wallet_used": cart.wallet_used,
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

    if cart.coupon_id:
        data["coupon"] = {"connect": {"id": cart.coupon_id}}
        data["coupon_code"] = cart.coupon_code
        from app.services.coupon import CouponService
        coupon_service = CouponService()
        await coupon_service.increment_coupon_usage(coupon_id=cart.coupon_id, user_id=user_id, discount_amount=cart.discount_amount)

    if cart.shipping_address_id:
        data["shipping_address"] = {"connect": {"id": cart.shipping_address_id}}

    try:
        new_order = await db.order.create(data=data)
    except Exception as e:
        logger.error(f"Failed to create order in create_order_from_cart: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    await publish_order_event(order=new_order, type="ORDER_CREATED")

    if order_in.payment_status == "SUCCESS":
        await publish_order_event(order=new_order, type="ORDER_PAID")

    return new_order

async def retrieve_order(order_id: str) -> Order:
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
        raise HTTPException(status_code=404, detail="order not found")
    return order

async def list_orders(
    user_id: int,
    skip: int = 0,
    take: int = 20,
    status: Optional[str] = None,
    order_number: Optional[str] = None,
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
    if order_number:
        where["order_number"] = order_number
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
            "coupon": True,
        }
    )
    total = await db.order.count(where=where)
    return {
        "orders": orders,
        "skip": skip,
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
            service = ShopSettingsService()
            shop_email = await service.get("shop_email")
            cc_list = [shop_email] if shop_email else []
            await notification.send_notification(
                channel_name="email",
                recipient=user.email,
                subject=email_data.subject,
                message=email_data.html_content,
                cc_list=cc_list,
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

        await notification.send_notification(
            channel_name="slack",
            slack_message=slack_message
        )
        logger.info(f"Slack notification sent to user: {user_id}")

        try:
            service = ShopSettingsService()
            contact = await service.get("whatsapp")
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
                await notification.send_notification(
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


async def create_invoice(order_id: int) -> str:
    """Generate and upload invoice PDF to Supabase storage, returning the download URL"""
    try:
        order = await db.order.find_unique(where={"id": order_id}, include={"order_items": True, "user": True, "shipping_address": True})
        if not order:
            logger.error(f"order not found for ID: {order_id}")
            raise Exception("order not found")
        settings = await db.shopsettings.find_many()
        settings_dict = {setting.key: setting.value for setting in settings}

        pdf_bytes = invoice_service.generate_invoice_pdf(order=order, company_info=settings_dict)

        timestamp: str = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename: str = f"invoice_{order.order_number}_{timestamp}_{uuid.uuid4().hex[:8]}.pdf"

        try:
            result = supabase.storage.from_("invoices").upload(filename, pdf_bytes, {
                "contentType": "application/pdf"
            })

            if not result:
                raise Exception("Failed to upload invoice to storage")
        except Exception as e:
            logger.error(e)
            raise Exception("Failed to upload invoice to storage.")

        public_url = supabase.storage.from_("invoices").get_public_url(filename, {"download": filename})

        await db.order.update(where={"id": order_id}, data={"invoice_url": public_url})

        await invalidate_pattern("orders")
        await invalidate_key(f"order:{order_id}")

        return public_url
    except Exception as e:
        logger.error(f"Unexpected error in download_invoice: {str(e)}")
        raise Exception("An unexpected error occurred while generating the invoice")


async def decrement_variant_inventory_for_order(order, notification=None) -> None:
    """
    Decrement inventory for each variant in the order. 
    If inventory reaches 0, set status to OUT_OF_STOCK and send notification.
    """
    out_of_stock_variants = []

    try:
        for item in order.order_items:
            variant_id = item.variant_id
            quantity = item.quantity
            variant = await db.productvariant.find_unique(where={"id": variant_id})
            if not variant:
                logger.info(f"Variant {variant_id} not found for order {order.id}")
                continue
            new_inventory = max(0, variant.inventory - quantity)
            update_data = {"inventory": new_inventory}
            out_of_stock = False
            if new_inventory == 0 and variant.status != "OUT_OF_STOCK":
                update_data["status"] = "OUT_OF_STOCK"
                out_of_stock = True
            await db.productvariant.update(where={"id": variant_id}, data=update_data)
            await reindex_product(product_id=variant.product_id)
            if out_of_stock:
                out_of_stock_variants.append(variant)
            logger.info(f"Decrementing inventory for variant {variant_id} in order {order.id}")
        await invalidate_pattern("gallery")
    except Exception as e:
        logger.error(f"Failed to decrement variant inventory for order {order.id}: {e}")
        raise Exception("Failed to decrement variant inventory for order")

    if out_of_stock_variants and notification:
        logger.info(f"Out of stock variants found for order {order.id}: {out_of_stock_variants}")
        # subject = f"Product Variants OUT OF STOCK in Order {order.id}"
        # message_lines = [
        #     f"The following product variants are now OUT OF STOCK due to order {order_id}:"
        # ]
        # for v in out_of_stock_variants:
        #     message_lines.append(f"- SKU: {v.sku}, Product ID: {v.product_id}")
        # message = "\n".join(message_lines)
        # service = ShopSettingsService()
        # try:
        #     await notification.send_notification(
        #         channel_name="email",
        #         recipient=await service.get("shop_email"),
        #         subject=subject,
        #         message=message
        #     )
        # except Exception as e:
        #     logger.error(f"Failed to send out-of-stock email: {e}")
        try:
            slack_text: str = f"🚨 *OUT OF STOCK* 🚨\nOrder ID: {order.id}\n" + "\n".join([
                f"• SKU: {v.sku}, Product ID: {v.product_id}" for v in out_of_stock_variants
            ])
            await notification.send_notification(
                channel_name="slack",
                slack_message={"text": slack_text}
            )
            await invalidate_pattern("orders")
        except Exception as e:
            logger.error(f"Failed to send out-of-stock slack: {e}")


async def send_payment_receipt(order, notification: Notification) -> None:
    try:
        email_data = await generate_payment_receipt(order=order, user=order.user)
        service = ShopSettingsService()
        shop_email: str | None = await service.get("shop_email")
        cc_list: list[str] | list[Unknown] = [shop_email] if shop_email else []
        await notification.send_notification(
            channel_name="email",
            recipient=order.user.email,
            subject=email_data.subject,
            message=email_data.html_content,
            cc_list=cc_list,
        )
        logger.info(f"Invoice email sent to user: {order.user_id}")
    except Exception as e:
        logger.error(f"Failed to generate invoice email: {e}")


async def process_order_payment(order_id: int, notification: Notification) -> None:
    order = await db.order.find_unique(
        where={"id": order_id}, 
        include={
            "order_items": {"include": { "variant": True }}, 
            "user": True
        }
    )
    if not order:
        logger.error(f"order not found for ID: {order_id}")
        raise Exception("order not found")
    await create_invoice(order_id)
    await send_payment_receipt(order=order, notification=notification)
    try:
        await decrement_variant_inventory_for_order(order=order, notification=notification)
    except Exception as e:
        logger.error(f"Failed to decrement variant inventory for order {order_id}: {e}")
    try:
        await process_referral(order=order, notification=notification)
    except Exception as e:
        logger.error(f"An error occurred while processing referral for order {order_id}: {e}")


async def return_order_item(order_id: int, item_id: int, background_tasks: BackgroundTasks) -> Order:
    """
    Return an item from an order:
    - Remove the order item
    - Increment the variant inventory
    - Recalculate order subtotal, tax and total
    - Create an order timeline entry
    - Invalidate caches and reindex product if needed
    """
    order_item = await db.orderitem.find_unique(
        where={"id": item_id},
        include={"variant": True, "order": True},
    )

    if not order_item or order_item.order_id != order_id:
        raise HTTPException(status_code=404, detail="order item not found")

    variant_id = order_item.variant_id
    quantity = order_item.quantity

    async with db.tx() as tx:
        updated_variant = None
        if variant_id is not None:
            variant = await tx.productvariant.find_unique(where={"id": variant_id})
            if variant and order_item.order.payment_status == "SUCCESS":
                logger.info(f"Incrementing inventory for variant {variant_id} in order {order_id}")
                new_inventory = (variant.inventory or 0) + quantity
                update_data = {
                    "inventory": new_inventory,
                    "status": "IN_STOCK" if new_inventory > 0 else variant.status,
                }
                updated_variant = await tx.productvariant.update(
                    where={"id": variant_id},
                    data=update_data,
                )

        await tx.orderitem.delete(where={"id": item_id})

        order = await tx.order.find_unique(where={"id": order_id})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        line_amount = float(order_item.price) * int(order_item.quantity)
        new_subtotal = max(0.0, float(order.subtotal or 0) - line_amount)

        settings_service = ShopSettingsService()
        tax_rate_str = await settings_service.get("tax_rate")
        tax_rate = float(tax_rate_str or 0)
        new_tax = new_subtotal * (tax_rate / 100.0)
        new_total = new_subtotal + new_tax + float(order.shipping_fee or 0)

        updated_order = await tx.order.update(
            where={"id": order_id},
            data={
                "subtotal": new_subtotal,
                "tax": new_tax,
                "total": new_total,
            },
        )

        try:
            message = f"Returned item: {order_item.name} x{order_item.quantity}"
            await tx.ordertimeline.create(
                data={
                    "order": {"connect": {"id": order_id}},
                    "from_status": updated_order.status,
                    "to_status": updated_order.status,
                    "message": message,
                }
            )
        except Exception as e:
            logger.error(f"Failed to append order timeline for return: {e}")

    async def invalidate_caches() -> None:
        try:
            await invalidate_pattern("orders")
            await invalidate_key(f"order:{order_id}")
            await invalidate_key(f"order-timeline:{order_id}")
            await invalidate_pattern("gallery")
            if order_item.variant and order_item.variant.product_id:
                await reindex_product(product_id=order_item.variant.product_id)
        except Exception as e:
            logger.error(f"Failed to invalidate caches/reindex after return: {e}")

    background_tasks.add_task(invalidate_caches)

    return {"message": "Item returned successfully"}

async def process_referral(order, notification=None) -> None:
    coupon_owner = await db.user.find_unique(where={"referral_code": order.coupon_code})
    async with db.tx() as tx:
        await tx.wallettransaction.create(
                data={
                    "user": {"connect": {"id": coupon_owner.id}},
                    "amount": order.discount_amount,
                    "reference_code": order.coupon_code,
                    "type": "CASHBACK",
                    "reference_id": order.order_number,
                }
            )
        await tx.user.update(where={"id": coupon_owner.id}, data={"wallet_balance": {"increment": order.discount_amount}})

