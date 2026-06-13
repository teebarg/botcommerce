import uuid
from fastapi import HTTPException, BackgroundTasks
from app.models.order import OrderCreate
from app.core.logging import logger
from app.services.invoice import invoice_service
from datetime import datetime
from app.core.deps import Notification, supabase
from app.services.product import index_product
from app.core.config import settings
from app.services.events import EventBus
from app.services.shop_settings import ShopSettingsService
from app.services.cart import get_cart
from typing import Any, Dict
from prisma import Prisma
from app.services.coupon import CouponService
from app.core.notifications.events import SendInvoiceEvent, OrderConfirmedEvent
from app.services.cache import CacheService


class OrderService:
    def __init__(
        self,
        db: Prisma,
        coupon_service: CouponService,
        settings_service: ShopSettingsService,
        notification_dispatcher: Notification,
        event_bus: EventBus,
        cache: CacheService
    ):
        self.db = db
        self.coupon_service = coupon_service
        self.settings_service = settings_service
        self.notification = notification_dispatcher
        self.event_bus = event_bus
        self.cache = cache

    async def create_order_from_cart(self, order_in: OrderCreate, user_id: int, cart_number: str) -> Any:
        order_number: str = f"ORD{uuid.uuid4().hex[:8].upper()}"
        cart = await get_cart(cart_number=cart_number, user_id=user_id)
        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")

        data: Dict[str, Any] = {
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
            await self.coupon_service.increment_coupon_usage(
                coupon_id=cart.coupon_id,
                user_id=user_id,
                discount_amount=cart.discount_amount
            )

        if cart.shipping_address_id:
            data["shipping_address"] = {"connect": {"id": cart.shipping_address_id}}

        try:
            new_order = await self.db.order.create(data=data)
        except Exception as e:
            logger.error(f"Failed to create order: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

        await self.event_bus.publish_order_event(order=new_order, event_type="ORDER_CREATED")

        if order_in.payment_status == "SUCCESS":
            await self.event_bus.publish_order_event(order=new_order, event_type="ORDER_PAID")

        await self.cache.invalidate(tags=["orders"])

        return new_order

    async def send_confirmation_notification(self, id: int, user_id: int) -> None:
        try:
            user = await self.db.user.find_unique(where={"id": user_id})
            if not user:
                logger.error(f"User not found for ID: {user_id}")
                return

            order = await self.db.order.find_unique(
                where={"id": id},
                include={"order_items": {"include": {"variant": True}}, "user": True, "shipping_address": True}
            )

            shop_email = await self.settings_service.get("shop_email")
            cc_list = [shop_email] if shop_email else []
            order_link: str = f"{settings.FRONTEND_HOST}/order/confirmed/{order.order_number}"
            items_overview: str = "\n".join(
                [f"• {it.name} x{it.quantity} - {it.price}" for it in (order.order_items or [])]
            ) or "No items found"

            await self.notification.dispatch(OrderConfirmedEvent(
                order=order,
                user=user,
                order_link=order_link,
                items_overview=items_overview,
                cc_list=cc_list
            ))
        except Exception as e:
            logger.error(f"Failed to send confirmation notification: {e}")

    async def create_invoice(self, order_id: int) -> str:
        try:
            order = await self.db.order.find_unique(
                where={"id": order_id},
                include={"order_items": True, "user": True, "shipping_address": True}
            )
            if not order:
                logger.error(f"Order not found for ID: {order_id}")
                raise Exception("Order not found")

            shop_settings = await self.db.shopsettings.find_many()
            settings_dict = {setting.key: setting.value for setting in shop_settings}

            pdf_bytes = invoice_service.generate_invoice_pdf(order=order, company_info=settings_dict)
            timestamp: str = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename: str = f"invoice_{order.order_number}_{timestamp}_{uuid.uuid4().hex[:8]}.pdf"

            result = supabase.storage.from_("invoices").upload(filename, pdf_bytes, {"contentType": "application/pdf"})
            if not result:
                raise Exception("Failed to upload invoice to storage")

            public_url = supabase.storage.from_("invoices").get_public_url(filename, {"download": filename})
            await self.db.order.update(where={"id": order_id}, data={"invoice_url": public_url})
            await self.cache.invalidate(f"order:{order_id}", tags=["orders"])
            return public_url
        except Exception as e:
            raise Exception(str(e))

    async def decrement_variant_inventory_for_order(self, order: Any) -> None:
        out_of_stock_variants = []
        try:
            for item in order.order_items:
                variant_id = item.variant_id
                quantity = item.quantity
                variant = await self.db.productvariant.find_unique(where={"id": variant_id})
                if not variant:
                    logger.warning(f"Variant {variant_id} not found for order {order.id}")
                    continue

                new_inventory = max(0, variant.inventory - quantity)
                update_data: Dict[str, Any] = {"inventory": new_inventory}
                out_of_stock = False

                if new_inventory == 0 and variant.status != "OUT_OF_STOCK":
                    update_data["status"] = "OUT_OF_STOCK"
                    out_of_stock = True

                await self.db.productvariant.update(where={"id": variant_id}, data=update_data)
                await index_product(product_id=variant.product_id)
                if out_of_stock:
                    out_of_stock_variants.append(variant)

            await self.cache.invalidate(tags=["gallery"])
        except Exception as e:
            logger.error(f"Failed to decrement variant inventory for order {order.id}: {e}")
            raise Exception("Failed to decrement variant inventory for order")

        if out_of_stock_variants and self.notification:
            try:
                slack_text: str = f"🚨 *OUT OF STOCK* 🚨\nOrder ID: {order.id}\n" + "\n".join([
                    f"• SKU: {v.sku}, Product ID: {v.product_id}" for v in out_of_stock_variants
                ])
                await self.notification.send_notification(
                    channel_name="slack",
                    slack_message={"text": slack_text}
                )
                await self.cache.invalidate(tags=["orders"])
            except Exception as e:
                logger.error(f"Failed to send out-of-stock slack: {e}")

    async def send_payment_receipt(self, order: Any) -> None:
        try:
            shop_email: str | None = await self.settings_service.get("shop_email")
            cc_list = [shop_email] if shop_email else []

            await self.notification.dispatch(SendInvoiceEvent(order=order, cc_list=cc_list))
            logger.debug(f"Invoice email sent to user: {order.user_id}")
        except Exception as e:
            logger.error(f"Failed to generate invoice email: {e}")

    async def process_order_payment(self, order_id: int) -> None:
        """Invoked by both API layer and internal Redis Stream Consumer tasks safely."""
        order = await self.db.order.find_unique(
            where={"id": order_id},
            include={"order_items": {"include": {"variant": True}}, "user": True}
        )
        if not order:
            logger.error(f"Order not found for ID: {order_id}")
            raise Exception("Order not found")

        try:
            await self.create_invoice(order_id)
        except Exception as e:
            logger.error(f"Failed to create invoice for order {order_id}: {e}")

        try:
             await self.send_payment_receipt(order=order)
        except Exception as e:
            logger.error(f"Failed to send payment receipt for order {order_id}: {e}")

        try:
            await self.decrement_variant_inventory_for_order(order=order)
        except Exception as e:
            logger.error(f"Failed to decrement variant inventory for order {order_id}: {e}")

        try:
            await self.process_referral(order=order)
        except Exception as e:
            logger.error(f"An error occurred while processing referral for order {order_id}: {e}")

    async def return_order_item(self, order_id: int, item_id: int, background_tasks: BackgroundTasks) -> Dict[str, str]:
        """
        Return an item from an order:
        - Remove the order item
        - Increment the variant inventory
        - Recalculate order subtotal, tax and total
        - Create an order timeline entry
        - Invalidate caches and reindex product if needed
        """
        order_item = await self.db.orderitem.find_unique(
            where={"id": item_id},
            include={"variant": True, "order": True},
        )

        if not order_item or order_item.order_id != order_id:
            raise HTTPException(status_code=404, detail="Order item not found")

        variant_id = order_item.variant_id
        quantity = order_item.quantity

        async with self.db.tx() as tx:
            if variant_id is not None:
                variant = await tx.productvariant.find_unique(where={"id": variant_id})
                if variant and order_item.order.payment_status == "SUCCESS":
                    new_inventory = (variant.inventory or 0) + quantity
                    await tx.productvariant.update(
                        where={"id": variant_id},
                        data={
                            "inventory": new_inventory,
                            "status": "IN_STOCK" if new_inventory > 0 else variant.status,
                        },
                    )

            await tx.orderitem.delete(where={"id": item_id})

            order = await tx.order.find_unique(where={"id": order_id})
            if not order:
                raise HTTPException(status_code=404, detail="Order not found")

            line_amount: float = float(order_item.price) * int(order_item.quantity)
            new_subtotal: float = max(0.0, float(order.subtotal or 0) - line_amount)

            tax_rate_str = await self.settings_service.get("tax_rate")
            tax_rate = float(tax_rate_str or 0)
            new_tax: float = new_subtotal * (tax_rate / 100.0)
            new_total: float = new_subtotal + new_tax + float(order.shipping_fee or 0)

            updated_order = await tx.order.update(
                where={"id": order_id},
                data={"subtotal": new_subtotal, "tax": new_tax, "total": new_total},
            )

            try:
                await tx.ordertimeline.create(
                    data={
                        "order": {"connect": {"id": order_id}},
                        "from_status": updated_order.status,
                        "to_status": updated_order.status,
                        "message": f"Returned item: {order_item.name} x{order_item.quantity}",
                    }
                )
            except Exception as e:
                logger.error(f"Failed to append order timeline for return: {e}")

        async def invalidate_caches() -> None:
            try:
                await self.cache.invalidate(f"order:{order_id}", f"order-timeline:{order_id}", tags=["orders"])
                if order_item.variant and order_item.variant.product_id:
                    await index_product(product_id=order_item.variant.product_id)
            except Exception as e:
                logger.error(f"Failed to invalidate caches/reindex after return: {e}")

        background_tasks.add_task(invalidate_caches)
        return {"message": "Item returned successfully"}

    async def process_referral(self, order: Any) -> None:
        if not order.coupon_code:
            return

        coupon_owner = await self.db.user.find_unique(where={"referral_code": order.coupon_code})
        if not coupon_owner:
            return

        async with self.db.tx() as tx:
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

        try:
            from app.core.utils import generate_referral_cashback_email
            email_data = await generate_referral_cashback_email(order=order, coupon_owner=coupon_owner)
            shop_email = await self.settings_service.get("shop_email")
            cc_list = [shop_email] if shop_email else []

            await self.notification.send_notification(
                channel_name="email",
                recipient=coupon_owner.email,
                subject=email_data.subject,
                message=email_data.html_content,
                cc_list=cc_list,
            )
            logger.debug(f"Referral cashback email sent to user: {coupon_owner.id}")
        except Exception as e:
            logger.error(f"Failed to generate referral cashback email: {e}")
