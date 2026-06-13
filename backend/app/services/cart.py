from typing import Optional, Dict, Any
from app.services.cache import CacheService
from fastapi import HTTPException
from app.prisma_client import prisma as db
from app.core.logging import get_logger
from app.services.shop_settings import ShopSettingsService
from app.core.utils import generate_id
from prisma.enums import CartStatus
from prisma import Prisma
from app.services.coupon import CouponService
from app.models.cart import Cart

logger = get_logger(__name__)


class CartRepository:
    def __init__(self, db: Prisma):
        self.db = db

    async def get_active_cart(self, cart_number: Optional[str], user_id: Optional[int], include_relations: bool = False) -> Cart | None:
        include_clause = {
            "items": {
                "order_by": {"created_at": "asc"},
                "include": {"variant": True}
            },
            "shipping_address": True
        } if include_relations else {"items": True}

        if user_id:
            cart = await self.db.cart.find_first(
                where={"user_id": user_id, "status": CartStatus.ACTIVE},
                include=include_clause,
                order={"created_at": "desc"}
            )
            if cart:
                return cart

        if cart_number:
            cart = await self.db.cart.find_unique(
                where={"cart_number": cart_number, "status": CartStatus.ACTIVE}, 
                include=include_clause
            )
            if cart:
                return cart
        return None

    async def create_empty_cart(self, user_id: Optional[int], include_relations: bool = False) -> Any:
        new_cart_id = generate_id()
        include_clause = {
            "items": {"include": {"variant": True}},
            "shipping_address": True
        } if include_relations else None
        
        return await self.db.cart.create(
            data={"cart_number": new_cart_id, "user_id": user_id},
            include=include_clause
        )


class CartService:
    def __init__(self, db: Prisma, repo: CartRepository, cache: CacheService, settings_service: ShopSettingsService, coupon_service: CouponService):
        self.db = db
        self.repo = repo
        self.settings_service = settings_service
        self.coupon_service = coupon_service
        self.cache = cache

    async def calculate_totals(self, cart_id: int) -> None:
        """Calculates and commits subtotal, tax, discounts, and wallet balances cleanly."""
        logger.debug(f"Recalculating totals for cart ID: {cart_id}")
        try:
            cart = await self.db.cart.find_unique(where={"id": cart_id})
            if not cart:
                return

            tax_rate = float(await self.settings_service.get("tax_rate"))
            cart_items = await self.db.cartitem.find_many(where={"cart_id": cart.id})

            subtotal = sum(item.price * item.quantity for item in cart_items)
            discount_amount = 0.0

            if cart.coupon_id:
                coupon = await self.db.coupon.find_unique(where={"id": cart.coupon_id})
                if coupon:
                    try:
                        await self.coupon_service.validate_coupon(
                            code=coupon.code,
                            cart=cart,
                            user_id=cart.user_id
                        )
                        discount_amount = await self.coupon_service.calculate_discount(coupon, subtotal)
                    except Exception:
                        discount_amount = 0.0
                        await self.db.cart.update(where={"id": cart.id}, data={"coupon_id": None})

            wallet_used = cart.wallet_used or 0.0
            new_subtotal = max(subtotal - discount_amount, 0.0)
            tax = new_subtotal * (tax_rate / 100)
            shipping_fee = cart.shipping_fee or 0.0
            
            total = new_subtotal + tax + shipping_fee
            total_after_wallet = max(total - wallet_used, 0.0)

            data: Dict[str, Any] = {
                "subtotal": subtotal,
                "tax": tax,
                "discount_amount": discount_amount,
                "total": total_after_wallet,
            }

            if total_after_wallet <= 0:
                data["payment_method"] = "WALLET"

            await self.db.cart.update(where={"id": cart.id}, data=data)
            await self.cache.invalidate(tags=["abandoned-carts", f"cart:{cart.cart_number}"])
        except Exception as e:
            logger.error(f"Error calculating cart totals: {e}", exc_info=True)

    async def add_item(self, cart: Any, variant_id: int, quantity: int) -> Any:
        variant = await self.db.productvariant.find_unique(
            where={"id": variant_id},
            include={"product": {"include": {"images": True}}}
        )

        if not variant:
            raise HTTPException(status_code=400, detail="Product variant does not exist")
        if variant.status != "IN_STOCK":
            raise HTTPException(status_code=400, detail="Product is out of stock")
        if quantity > variant.inventory:
            raise HTTPException(status_code=400, detail=f"Not enough inventory. Only {variant.inventory} items left.")

        return await self.db.cartitem.create(
            data={
                "cart_id": cart.id,
                "cart_number": cart.cart_number,
                "name": variant.product.name,
                "slug": variant.product.slug,
                "variant_id": variant_id,
                "quantity": quantity,
                "price": variant.price,
                "image": variant.product.images[0].image if variant.product.images else variant.product.image
            },
            include={"variant": True}
        )

    async def merge_guest_into_user_cart(self, user_id: int, cart_number: Optional[str] = None) -> None:
        if not cart_number:
            return
            
        try:
            async with self.db.tx() as tx:
                user_cart = await tx.cart.find_first(
                    where={"user_id": user_id, "status": "ACTIVE"},
                    include={"items": True},
                )
                guest_cart = await tx.cart.find_first(
                    where={"cart_number": cart_number, "user_id": None, "status": "ACTIVE"},
                    include={"items": True},
                )

                if user_cart and guest_cart:
                    user_items_map = {item.variant_id: item for item in user_cart.items}

                    for guest_item in guest_cart.items:
                        existing_item = user_items_map.get(guest_item.variant_id)
                        if existing_item:
                            await tx.cartitem.update(
                                where={"id": existing_item.id},
                                data={"quantity": existing_item.quantity + guest_item.quantity},
                            )
                        else:
                            await tx.cartitem.update(
                                where={"id": guest_item.id},
                                data={"cart_id": user_cart.id, "cart_number": user_cart.cart_number},
                            )
                    await tx.cart.delete(where={"id": guest_cart.id})
                    target_id = user_cart.id
                elif guest_cart and not user_cart:
                    await tx.cart.update(where={"id": guest_cart.id}, data={"user_id": user_id})
                    target_id = guest_cart.id
                else:
                    return

            await self.calculate_totals(cart_id=target_id)
        except Exception as e:
            logger.error(f"Error merging carts: {e}", exc_info=True)

    async def apply_wallet_balance(self, cart: Any, user: Any) -> None:
        if not user.wallet_balance or user.wallet_balance <= 0:
            raise HTTPException(status_code=400, detail="Wallet balance is empty")

        subtotal = cart.subtotal or 0.0
        tax = cart.tax or 0.0
        shipping = cart.shipping_fee or 0.0
        discount = cart.discount_amount or 0.0

        total_payable = max(subtotal + tax + shipping - discount, 0.0)
        wallet_to_use = min(user.wallet_balance, total_payable)
        remaining_total = max(total_payable - wallet_to_use, 0.0)

        data = {"wallet_used": wallet_to_use, "total": remaining_total}
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
            await tx.user.update(where={"id": user.id}, data={"wallet_balance": {"decrement": wallet_to_use}})

    async def remove_wallet_balance(self, cart: Any, user: Any) -> None:
        wallet_used = cart.wallet_used or 0.0
        if wallet_used <= 0:
            raise HTTPException(status_code=400, detail="No wallet balance applied to this cart")

        async with self.db.tx() as tx:
            await tx.user.update(where={"id": user.id}, data={"wallet_balance": {"increment": wallet_used}})
            await tx.wallettransaction.create(
                data={
                    "user": {"connect": {"id": user.id}},
                    "amount": wallet_used,
                    "reference_code": "WALLET_REVERSAL",
                    "type": "REVERSAL",
                    "reference_id": cart.cart_number,
                }
            )
            await tx.cart.update(where={"id": cart.id}, data={"wallet_used": 0.0, "payment_method": None})