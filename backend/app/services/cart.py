from typing import Optional
import logging
from app.prisma_client import prisma as db
from prisma.enums import CartStatus
from app.models.cart import Cart
from app.services.redis import invalidate_pattern
from app.services.shop_settings import ShopSettingsService

logger = logging.getLogger(__name__)


async def get_cart(cart_number: Optional[str], user_id: Optional[str]) -> Cart | None:
    """Retrieve an existing cart"""
    if user_id:
        cart = await db.cart.find_first(
            where={"user_id": user_id, "status": CartStatus.ACTIVE},
            include={"items": True},
            order={"created_at": "desc"}
        )
        if cart:
            return cart

    if cart_number:
        cart = await db.cart.find_unique(where={"cart_number": cart_number, "status": CartStatus.ACTIVE}, include={"items": True})
        if cart:
            return cart
    return None


async def calculate_cart_totals(cart_id: int):
    """Helper function to calculate cart totals"""
    logger.info(f"Calculating cart totals for cart {cart_id}")
    try:
        from app.services.coupon import CouponService
        service = ShopSettingsService()

        cart = await db.cart.find_unique(where={"id": cart_id})

        tax_rate = float(await service.get("tax_rate"))
        cart_items = await db.cartitem.find_many(where={"cart_id": cart.id})

        subtotal = sum(item.price * item.quantity for item in cart_items)

        discount_amount = 0.0
        if cart.coupon_id:
            coupon_service = CouponService()
            coupon = await db.coupon.find_unique(where={"id": cart.coupon_id})
            if coupon:
                try:
                    await coupon_service.validate_coupon(
                        code=coupon.code,
                        cart=cart,
                        user_id=cart.user_id
                    )
                    discount_amount = await coupon_service.calculate_discount(coupon, subtotal)
                except Exception:
                    discount_amount = 0.0
                    await db.cart.update(
                        where={"id": cart.id},
                        data={"coupon_id": None}
                    )

        wallet_used = 0
        if cart.wallet_used > 0:
            wallet_used: float = cart.wallet_used

        new_subtotal: float = max(subtotal - discount_amount, 0)
        tax: float = new_subtotal * (tax_rate / 100)
        shipping_fee = cart.shipping_fee or 0
        total: float = new_subtotal + tax + shipping_fee

        total_after_wallet: float = max(total - wallet_used, 0)

        data={
            "subtotal": subtotal,
            "tax": tax,
            "discount_amount": discount_amount,
            "total": total_after_wallet,
        }

        if total <= 0:
            data["payment_method"] = "WALLET"

        await db.cart.update(where={"id": cart.id}, data=data)
        await invalidate_pattern("abandoned-carts")
        await invalidate_pattern("carts")
    except Exception as e:
        logger.error(f"Error calculating cart totals: {e}")


async def merge_cart(user_id: int, cart_number: Optional[str] = None) -> None:
    logger.info(f"Merging cart for user {user_id} with cart number {cart_number}")
    try:
        async with db.tx() as tx:
            user_cart = await tx.cart.find_first(
                where={"user_id": user_id, "status": "ACTIVE"},
                include={"items": True},
            )

            guest_cart = None
            if cart_number:
                guest_cart = await tx.cart.find_first(
                    where={
                        "cart_number": cart_number,
                        "user_id": None,
                        "status": "ACTIVE",
                    },
                    include={"items": True},
                )

            # ----------------------------------------
            # CASE 1: Both carts exist — merge items
            # ----------------------------------------
            if user_cart and guest_cart:
                logger.info(
                    f"Merging guest cart {guest_cart.cart_number} "
                    f"into user cart {user_cart.cart_number}"
                )

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
                            data={
                                "cart_id": user_cart.id,
                                "cart_number": user_cart.cart_number,
                            },
                        )

                await tx.cart.delete(where={"id": guest_cart.id})

            # ----------------------------------------
            # CASE 2: Only guest cart exists — claim it
            # ----------------------------------------
            elif guest_cart and not user_cart:
                logger.info(
                    f"Claiming guest cart {guest_cart.cart_number} for user {user_id}"
                )
                await tx.cart.update(
                    where={"id": guest_cart.id},
                    data={"user_id": user_id},
                )

            else:
                logger.debug(f"No carts to merge for user {user_id}")
                return

        target_cart_id = user_cart.id if user_cart else guest_cart.id
        await calculate_cart_totals(cart_id=target_cart_id)

    except Exception as e:
        logger.error(f"Error merging cart: {e}")