import uuid
from typing import Any, Optional

from arq.connections import ArqRedis
from fastapi import BackgroundTasks, HTTPException

from app.core.logging import logger
from app.models.order import PaginatedOrders
from app.services.cache import CacheService
from app.services.cart import CartService
from app.services.coupon import CouponService
from app.services.payment import PaymentService
from app.services.product import ProductService
from app.services.shop_settings import ShopSettingsService
from prisma import Prisma


class OrderService:
    def __init__(
        self,
        db: Prisma,
        cart_srv: CartService,
        product_srv: ProductService,
        coupon_srv: CouponService,
        settings_srv: ShopSettingsService,
        queue: ArqRedis,
        cache_srv: CacheService,
        payment_srv: PaymentService
    ):
        self.db = db
        self.cart_srv = cart_srv
        self.product_srv = product_srv
        self.coupon_srv = coupon_srv
        self.settings_srv = settings_srv
        self.cache_srv = cache_srv
        self.queue = queue
        self.payment_srv = payment_srv

    async def get_by_number(
        self, order_number: str, include_relations: bool = True
    ) -> Any:
        if not include_relations:
            return await self.db.order.find_unique(where={"order_number": order_number})

        return await self.db.order.find_unique(
            where={"order_number": order_number},
            include={
                "order_items": {"include": {"variant": True}},
                "user": True,
                "shipping_address": True,
            },
        )

    async def get_by_id(self, order_id: int, include_relations: bool = False) -> Any:
        include_clause = (
            {
                "order_items": {"include": {"variant": True}},
                "user": True,
                "shipping_address": True,
            }
            if include_relations
            else None
        )

        return await self.db.order.find_unique(
            where={"id": order_id}, include=include_clause
        )

    async def list_paginated(
        self,
        user_id: int,
        cursor: Optional[int] = None,
        limit: int = 20,
        status: Optional[str] = None,
        order_number: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        customer_id: Optional[int] = None,
        user_role: str = "CUSTOMER",
        sort: str = "desc",
    ) -> PaginatedOrders:
        where: dict[str, Any] = {}
        if status:
            where["status"] = status
        if customer_id:
            where["user_id"] = customer_id
        if order_number:
            where["order_number"] = order_number
        if user_role == "CUSTOMER":
            where["user_id"] = user_id
        if start_date or end_date:
            where["created_at"] = {}
            if start_date:
                where["created_at"]["gte"] = start_date
            if end_date:
                where["created_at"]["lte"] = end_date

        orders = await self.db.order.find_many(
            where=where,
            order={"created_at": sort},
            skip=1 if cursor else 0,
            take=limit + 1,
            cursor={"id": cursor} if cursor else None,
            include={
                "order_items": {"include": {"variant": True}},
                "user": True,
                "shipping_address": True,
                "coupon": True,
            },
        )

        items = orders[:limit]
        next_cursor = items[-1].id if len(orders) > limit else None

        return {"items": items, "next_cursor": next_cursor, "limit": limit}

    async def place_order_from_cart(self, user_id: int, email: str, cart_number: str) -> Any:
        cart = await self.cart_srv.get_active_cart(
            cart_number=cart_number, user_id=user_id, include_relations=True
        )
        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")

        if not cart.items:
            raise HTTPException(status_code=400, detail="Your cart is empty")

        out_of_stock_items = [
            item
            for item in cart.items
            if getattr(item.variant, "status", None) == "OUT_OF_STOCK"
        ]
        if out_of_stock_items:
            names = ", ".join(
                item.name or "Unnamed item" for item in out_of_stock_items
            )
            raise HTTPException(
                status_code=400,
                detail=f"Some items in your cart are out of stock and must be removed before checkout: {names}",
            )

        cart_totals = await self.cart_srv.calculate_totals(cart=cart)
        async with self.db.tx() as tx:
            data: dict[str, Any] = {
                "order_number": f"ORD{uuid.uuid4().hex[:10].upper()}",
                "email": cart.email or email,
                "phone": cart.phone,
                "shipping_fee": cart.shipping_fee,
                "subtotal": cart_totals["subtotal"],
                "tax": cart_totals["tax"],
                "discount_amount": cart_totals["discount_amount"],
                "total": cart_totals["total"],
                "wallet_used": cart.wallet_used,
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
                            "price": item.variant.price,
                        }
                        for item in cart.items or []
                    ]
                },
            }

            if cart.coupon_id:
                data["coupon"] = {"connect": {"id": cart.coupon_id}}
                data["coupon_code"] = cart.coupon_code

            if cart.shipping_address_id:
                data["shipping_address"] = {"connect": {"id": cart.shipping_address_id}}

            try:
                new_order = await tx.order.create(data=data)
            except Exception as e:
                logger.error(f"Failed to create order: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

            await tx.ordertimeline.create(
                data={
                    "order": {"connect": {"id": new_order.id}},
                    "from_status": "PENDING",
                    "to_status": "PENDING",
                    "message": "Order placed",
                }
            )
            await tx.cartitem.delete_many(where={"cart_id": cart.id})
            await tx.cart.update(
                where={"id": cart.id},
                data={
                    "coupon_id": None,
                    "coupon_code": None,
                    "shipping_fee": 0,
                    "discount_amount": 0,
                },
            )
            await tx.payment.create(
                data={
                    "order": {"connect": {"id": new_order.id}},
                    "reference": f"{new_order.payment_method}-{new_order.order_number}",
                    "transaction_id": f"{new_order.payment_method}-{new_order.order_number}",
                    "amount": new_order.total,
                    "status": "PENDING",
                    "payment_method": new_order.payment_method,
                }
            )
            await self.queue.enqueue_job("order_created", order_id=new_order.id)

            if cart.payment_method == "WALLET" and (cart.total or 0) <= 0:
                await self.payment_srv.record_success(
                    reference=f"WALLET-{new_order.order_number}",
                )

            if cart.coupon_id:
                await self.coupon_srv.increment_coupon_usage(
                    coupon_id=cart.coupon_id,
                    user_id=user_id,
                    discount_amount=cart.discount_amount,
                )

            await self.cache_srv.invalidate(tags=["orders", "stats-trends"])
            return new_order

    async def decrement_variant_inventory_for_order(self, order_id: int) -> None:
        order = await self.get_by_id(order_id=order_id, include_relations=True)
        if not order:
            logger.error(f"Order not found for ID: {order_id}")
            raise Exception("Order not found")

        for item in order.order_items:
            try:
                variant_id = item.variant_id
                quantity = item.quantity

                new_inventory = max(0, item.variant.inventory - quantity)
                update_data: dict[str, Any] = {"inventory": new_inventory}

                if new_inventory == 0 and item.variant.status != "OUT_OF_STOCK":
                    update_data["status"] = "OUT_OF_STOCK"

                await self.db.productvariant.update(
                    where={"id": variant_id}, data=update_data
                )
                await self.product_srv.index_product(product_id=item.variant.product_id)

            except Exception as e:
                logger.error(
                    f"Failed to decrement inventory for item {item.id} on order {order.id}: {e}"
                )
        await self.cache_srv.invalidate(tags=["gallery"])

    async def return_order_item(
        self, order_id: int, item_id: int, background_tasks: BackgroundTasks
    ) -> dict[str, str]:
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
                            "status": "IN_STOCK"
                            if new_inventory > 0
                            else variant.status,
                        },
                    )

            await tx.orderitem.delete(where={"id": item_id})

            order = await tx.order.find_unique(where={"id": order_id})
            if not order:
                raise HTTPException(status_code=404, detail="Order not found")

            line_amount: float = float(order_item.price) * int(order_item.quantity)
            new_subtotal: float = max(0.0, float(order.subtotal or 0) - line_amount)

            tax_rate_str = await self.settings_srv.get("tax_rate")
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
            await self.cache_srv.invalidate(f"order:{order_id}", tags=["orders"])

        async def invalidate_caches() -> None:
            try:
                await self.cache_srv.invalidate(
                    f"order:{order_id}",
                    f"order-timeline:{order_id}",
                    tags=["orders", f"wallet:{order.user.id}"],
                )
                if order_item.variant and order_item.variant.product_id:
                    await self.product_srv.index_product(product_id=order_item.variant.product_id)
            except Exception as e:
                logger.error(f"Failed to invalidate caches/reindex after return: {e}")

        background_tasks.add_task(invalidate_caches)
        return {"message": "Item returned successfully"}
