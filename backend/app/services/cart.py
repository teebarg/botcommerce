from datetime import datetime, timedelta
from typing import Any, Optional

from fastapi import HTTPException
from prisma.enums import CartStatus

from app.core.logging import get_logger
from app.core.utils import generate_id
from app.models.cart import Cart
from app.models.user import User
from app.schemas.cart import CartResponse
from app.services.cache import CacheService
from app.services.coupon import CouponService
from app.services.shop_settings import ShopSettingsService
from prisma import Prisma

logger = get_logger(__name__)

ABANDONED_THRESHOLD_HOURS = 2


class CartService:
    def __init__(
        self,
        db: Prisma,
        cache_srv: CacheService,
        settings_srv: ShopSettingsService,
        coupon_srv: CouponService,
    ):
        self.db = db
        self.settings_srv = settings_srv
        self.coupon_srv = coupon_srv
        self.cache_srv = cache_srv

    def _abandoned_cutoff(self) -> datetime:
        return datetime.utcnow() - timedelta(hours=ABANDONED_THRESHOLD_HOURS)

    async def _with_computed_totals(self, cart) -> CartResponse:
        cart_totals = await self.calculate_totals(cart=cart)

        return CartResponse(
            id=cart.id,
            cart_number=cart.cart_number,
            user_id=cart.user_id,
            user=cart.user,
            status=cart.status,
            email=cart.email,
            phone=cart.phone,
            subtotal=cart_totals["subtotal"],
            tax=cart_totals["tax"],
            discount_amount=cart_totals["discount_amount"],
            total=cart_totals["total"],
            payment_method=cart.payment_method,
            shipping_method=cart.shipping_method,
            shipping_fee=cart.shipping_fee,
            shipping_address_id=cart.shipping_address_id,
            shipping_address=cart.shipping_address,
            wallet_used=cart.wallet_used,
            coupon_code=cart.coupon_code,
            coupon_id=cart.coupon_id,
            items=cart.items,
            created_at=cart.created_at,
        )

    async def touch(self, cart_id: int) -> None:
        await self.db.cart.update(where={"id": cart_id}, data={"updated_at": datetime.utcnow()})

    async def get_abandoned(self) -> list[Cart]:
        where: dict = {
            "status": "ACTIVE",
            "updated_at": {"lt": self._abandoned_cutoff()},
            "items": {"some": {}},  # only carts that actually have items
        }

        items = await self.db.cart.find_many(
            where=where,
            order={"updated_at": "desc"},
            include={"items": {"include":{"variant": True}}, "user": True},
        )

        return items


    async def get_abandoned_paginated(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
    ) -> tuple[list[Cart], int]:
        where: dict = {
            "status": "ACTIVE",
            "updated_at": {"lt": self._abandoned_cutoff()},
            "items": {"some": {}},  # only carts that actually have items
        }
        if search:
            where["OR"] = [
                {"cart_number": {"contains": search, "mode": "insensitive"}},
                {"email": {"contains": search, "mode": "insensitive"}},
                {"phone": {"contains": search}},
            ]

        items = await self.db.cart.find_many(
            where=where,
            skip=skip,
            take=limit,
            order={"updated_at": "desc"},
            include={"items": {"include":{"variant": True}}, "user": True},
        )
        total = await self.db.cart.count(where=where)
        return items, total

    async def get_by_id(self, id: int) -> Optional[Cart]:
        return await self.db.cart.find_unique(
            where={"id": id}, include={"items": True}
        )

    async def get_active_cart(
        self,
        cart_number: str | None = None,
        user_id: int | None = None,
        include_relations: bool = False,
    ) -> Cart | None:
        include_clause = (
            {
                "items": {
                    "order_by": {"created_at": "asc"},
                    "include": {"variant": True},
                },
                "shipping_address": True,
            }
            if include_relations
            else {"items": True}
        )

        if user_id:
            cart = await self.db.cart.find_first(
                where={"user_id": user_id, "status": CartStatus.ACTIVE},
                include=include_clause,
                order={"created_at": "desc"},
            )
            if cart:
                return cart

        if cart_number:
            cart = await self.db.cart.find_unique(
                where={"cart_number": cart_number, "status": CartStatus.ACTIVE},
                include=include_clause,
            )
            if cart:
                return cart
        return None

    async def create_empty_cart(
        self, user_id: int | None, include_relations: bool = False
    ) -> Any:
        new_cart_id = generate_id()
        include_clause = (
            {"items": {"include": {"variant": True}}, "shipping_address": True}
            if include_relations
            else None
        )
        target = None
        if user_id:
            target = await self.db.user.find_unique(where={"id": user_id})

        return await self.db.cart.create(
            data={
                "cart_number": new_cart_id,
                "user_id": user_id,
                "phone": target.phone if target else None,
            },
            include=include_clause,
        )

    async def calculate_totals(self, cart: Cart) -> None:
        """Calculates and commits subtotal, tax, discounts, and wallet balances cleanly."""
        logger.debug(f"Recalculating totals for cart ID: {cart.id}")
        try:
            tax_rate = float(await self.settings_srv.get("tax_rate"))
            subtotal = sum(
                (item.variant.price if item.variant else 0) * item.quantity
                for item in cart.items
            )
            discount_amount = 0.0

            if cart.coupon_id:
                coupon = await self.coupon_srv.get_by_id(id=cart.coupon_id)
                if coupon:
                    try:
                        await self.coupon_srv.validate_coupon(
                            code=coupon.code, cart=cart, user_id=cart.user_id
                        )
                        discount_amount = await self.coupon_srv.calculate_discount(coupon, subtotal)
                    except Exception:
                        discount_amount = 0.0
                        await self.db.cart.update(
                            where={"id": cart.id}, data={"coupon_id": None}
                        )

            wallet_used = cart.wallet_used or 0.0
            discount_subtotal = max(0.0, subtotal - discount_amount)
            computed_tax = round(discount_subtotal * (tax_rate / 100), 2)
            shipping_fee = cart.shipping_fee or 0.0

            total = discount_subtotal + computed_tax + shipping_fee
            total_after_wallet = round(max(total - wallet_used, 0.0))

            data: dict[str, float] = {
                "subtotal": subtotal,
                "tax": computed_tax,
                "discount_amount": discount_amount,
                "total": total_after_wallet,
            }

            if total_after_wallet <= 0:
                data["payment_method"] = "WALLET"

            return data
        except Exception as e:
            logger.error(f"Error calculating cart totals: {e}", exc_info=True)

    async def add_item(self, cart: Any, variant_id: int, quantity: int) -> Any:
        variant = await self.db.productvariant.find_unique(
            where={"id": variant_id}, include={"product": {"include": {"images": True}}}
        )

        if not variant:
            raise HTTPException(
                status_code=400, detail="Product variant does not exist"
            )
        if variant.status != "IN_STOCK":
            raise HTTPException(status_code=400, detail="Product is out of stock")
        if quantity > variant.inventory:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough inventory. Only {variant.inventory} items left.",
            )

        return await self.db.cartitem.create(
            data={
                "cart_id": cart.id,
                "cart_number": cart.cart_number,
                "name": variant.product.name,
                "slug": variant.product.slug,
                "variant_id": variant_id,
                "quantity": quantity,
                "price": variant.price,
                "image": variant.product.images[0].image
                if variant.product.images
                else variant.product.image,
            },
            include={"variant": True},
        )

    async def merge_guest_into_user_cart(
        self, user_id: int, cart_number: Optional[str] = None
    ) -> None:
        if not cart_number:
            return

        try:
            async with self.db.tx() as tx:
                user_cart = await tx.cart.find_first(
                    where={"user_id": user_id, "status": "ACTIVE"},
                    include={"items": True},
                )
                guest_cart = await tx.cart.find_first(
                    where={
                        "cart_number": cart_number,
                        "user_id": None,
                        "status": "ACTIVE",
                    },
                    include={"items": True},
                )

                if user_cart and guest_cart:
                    user_items_map = {item.variant_id: item for item in user_cart.items}

                    for guest_item in guest_cart.items:
                        existing_item = user_items_map.get(guest_item.variant_id)
                        if existing_item:
                            await tx.cartitem.update(
                                where={"id": existing_item.id},
                                data={
                                    "quantity": existing_item.quantity
                                    + guest_item.quantity
                                },
                            )
                        else:
                            await tx.cartitem.update(
                                where={"id": guest_item.id},
                                data={
                                    "cart_id": user_cart.id,
                                    "cart_number": user_cart.cart_number,
                                },
                            )
                    await tx.cart.delete(where={"id": guest_cart.id})
                elif guest_cart and not user_cart:
                    await tx.cart.update(
                        where={"id": guest_cart.id}, data={"user_id": user_id}
                    )
                else:
                    return
        except Exception as e:
            logger.error(f"Error merging carts: {e}", exc_info=True)

    async def apply_wallet_balance(self, cart: Cart, user: User) -> None:
        if not user.wallet_balance or user.wallet_balance <= 0:
            raise HTTPException(status_code=400, detail="Wallet balance is empty")

        subtotal = cart.subtotal or 0.0
        tax = cart.tax or 0.0
        shipping = cart.shipping_fee or 0.0
        discount = cart.discount_amount or 0.0

        total_payable = max(subtotal + tax + shipping - discount, 0.0)
        wallet_to_use = min(user.wallet_balance, total_payable)
        remaining_total = max(total_payable - wallet_to_use, 0.0)

        data: dict[str, float | str] = {
            "wallet_used": wallet_to_use,
            "total": remaining_total,
        }
        if remaining_total <= 0:
            data["payment_method"] = "WALLET"

        async with self.db.tx() as tx:
            await tx.cart.update(where={"id": cart.id}, data=data)
            await tx.wallettransaction.create(
                data={
                    "user": {"connect": {"id": user.id}},
                    "amount": wallet_to_use,
                    "reference_code": "WALLET_PAYMENT",
                    "type": "WITHDRAWAL",
                    "reference_id": cart.cart_number,
                }
            )
            await tx.user.update(
                where={"id": user.id},
                data={"wallet_balance": {"decrement": wallet_to_use}},
            )

    async def remove_wallet_balance(self, cart: Cart, user: User) -> None:
        wallet_used = cart.wallet_used or 0.0
        if wallet_used <= 0:
            raise HTTPException(
                status_code=400, detail="No wallet balance applied to this cart"
            )

        async with self.db.tx() as tx:
            await tx.user.update(
                where={"id": user.id},
                data={"wallet_balance": {"increment": wallet_used}},
            )
            await tx.wallettransaction.create(
                data={
                    "user": {"connect": {"id": user.id}},
                    "amount": wallet_used,
                    "reference_code": "WALLET_REVERSAL",
                    "type": "REVERSAL",
                    "reference_id": cart.cart_number,
                }
            )
            await tx.cart.update(
                where={"id": cart.id}, data={"wallet_used": 0.0, "payment_method": None}
            )

    async def update_contact(self, user_id, phone) -> None:
        await self.db.user.update_many(
            where={
                "id": user_id,
                "phone": None,
            },
            data={"phone": phone},
        )

    async def delete(self, id: int) -> Optional[Cart]:
        return await self.db.cart.delete(where={"id": id})
