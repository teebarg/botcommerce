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


async def calculate_cart_totals(cart: Cart):
    """Helper function to calculate cart totals"""
    logger.info(f"Calculating cart totals for cart {cart.id}")
    from app.services.coupon import CouponService
    service = ShopSettingsService()

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


async def merge_cart(user_id: int, cart_number: Optional[str] = None) -> None:
    logger.info(f"Merging cart for user {user_id} with cart number {cart_number}")
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

        if user_cart and guest_cart:
            logger.info(f"User cart found: {user_cart}")
            logger.info(f"Guest cart found: {guest_cart}")
            # Map user items for O(1) lookup
            user_items_map = {
                (item.product_id, item.variant_id): item
                for item in user_cart.items
            }

            for guest_item in guest_cart.items:
                key = (guest_item.product_id, guest_item.variant_id)

                if key in user_items_map:
                    existing_item = user_items_map[key]

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
                        data={"cart_id": user_cart.id},
                    )

            # -------------------------------
            # Metadata merge strategy
            # -------------------------------
            update_data = {}

            # Only copy guest data if user cart lacks it
            if not user_cart.coupon_id and guest_cart.coupon_id:
                update_data["coupon_id"] = guest_cart.coupon_id

            if not user_cart.shipping_address_id and guest_cart.shipping_address_id:
                update_data["shipping_address_id"] = guest_cart.shipping_address_id

            if not user_cart.billing_address_id and guest_cart.billing_address_id:
                update_data["billing_address_id"] = guest_cart.billing_address_id

            if update_data:
                await tx.cart.update(
                    where={"id": user_cart.id},
                    data=update_data,
                )

            await tx.cart.delete(where={"id": guest_cart.id})
            await calculate_cart_totals(user_cart)
            return

            # return await tx.cart.find_unique(
            #     where={"id": user_cart.id},
            #     include={"items": True},
            # )

        # -------------------------------
        # CASE 2: ONLY guest cart
        # -------------------------------
        if not user_cart and guest_cart:
            logger.info(f"Only guest cart found, updating user_id")
            updated = await tx.cart.update(
                where={"id": guest_cart.id},
                data={"user_id": user_id},
            )

            # await recalculate_cart(tx, updated.id)
            await calculate_cart_totals(updated)
            return

        # -------------------------------
        # CASE 3: ONLY user cart
        # -------------------------------
        # if user_cart:
        #     return

        # -------------------------------
        # CASE 4: NO cart → create
        # -------------------------------
        # new_cart = await tx.cart.create(
        #     data={
        #         "user_id": user_id,
        #         "status": "ACTIVE",
        #     }
        # )

        # return new_cart