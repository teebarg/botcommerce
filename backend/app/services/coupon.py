from datetime import datetime, timezone
from typing import Optional
from fastapi import HTTPException
from app.prisma_client import prisma as db
from prisma.enums import DiscountType
from app.models.coupon import CouponScope
from prisma.models import Coupon, Cart
from app.core.logging import get_logger

logger = get_logger(__name__)

class CouponService:
    async def validate_coupon(
        self,
        code: str,
        cart: Optional[Cart] = None,
        user_id: Optional[int] = None
    ) -> Coupon:
        """
        Validate a coupon code for a cart and user.
        Returns coupon if valid, raises HTTPException if invalid.
        """
        coupon = await db.coupon.find_unique(
            where={"code": code.upper()},
            include={"users": True}
        )

        if not coupon:
            raise HTTPException(status_code=404, detail="Coupon code not found")

        if not coupon.is_active:
            raise HTTPException(status_code=400, detail="Coupon is inactive")

        now = datetime.now(timezone.utc)
        if coupon.valid_from > now:
            raise HTTPException(
                status_code=400,
                detail=f"Coupon is not yet valid. Valid from {coupon.valid_from}"
            )

        if coupon.valid_until < now:
            raise HTTPException(status_code=400, detail="Coupon has expired")

        if coupon.current_uses >= coupon.max_uses:
            raise HTTPException(
                status_code=400,
                detail="Coupon has reached maximum usage limit"
            )

        if coupon.max_uses_per_user > 0:
            if user_id:
                usage_count = await db.couponusage.count(
                    where={
                        "coupon_id": coupon.id,
                        "user_id": user_id
                    }
                )
                if usage_count >= coupon.max_uses_per_user:
                    raise HTTPException(
                        status_code=400,
                        detail="You have reached the maximum usage limit for this coupon."
                    )

        if coupon.scope == CouponScope.SPECIFIC_USERS:
            if not user_id:
                raise HTTPException(
                    status_code=400,
                    detail="Coupon is only available for specific users. Please log in."
                )

            if not any(user.id == user_id for user in coupon.users):
                raise HTTPException(
                    status_code=403,
                    detail="This coupon is not available for your account"
                )

        # Validate cart requirements
        if cart:
            cart_items = await db.cartitem.find_many(
                where={"cart_id": cart.id}
            )

            current_subtotal = sum(item.price * item.quantity for item in cart_items)

            if coupon.min_cart_value:
                if current_subtotal < coupon.min_cart_value:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Minimum cart value of ₦{coupon.min_cart_value:,.2f} required to use this coupon"
                    )

            if coupon.min_item_quantity:
                total_items = sum(item.quantity for item in cart_items)
                if total_items < coupon.min_item_quantity:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Minimum {coupon.min_item_quantity} items required to use this coupon"
                    )

        return coupon

    async def calculate_discount(
        self,
        coupon: Coupon,
        cart_subtotal: float
    ) -> float:
        """
        Calculate discount amount based on coupon type and cart subtotal.
        """
        if coupon.discount_type == DiscountType.PERCENTAGE:
            discount = cart_subtotal * (coupon.discount_value / 100)
            return min(discount, cart_subtotal)
        else:
            return min(coupon.discount_value, cart_subtotal)

    async def apply_coupon_to_cart(
        self,
        coupon: Coupon,
        cart: Cart
    ) -> Cart:
        """
        Apply coupon to cart and update totals.
        """
        discount_amount = await self.calculate_discount(coupon, cart.subtotal)
        total = cart.subtotal + cart.tax + cart.shipping_fee - discount_amount
        data = {
            "coupon_id": coupon.id,
            "discount_amount": discount_amount,
            "total": total,
        }
        if total < 1:
            data["payment_method"] = "COUPON"

        updated_cart = await db.cart.update( where={"id": cart.id}, data=data)

        return updated_cart

    async def remove_coupon_from_cart(self, cart: Cart) -> Cart:
        """
        Remove coupon from cart and recalculate totals.
        """
        updated_cart = await db.cart.update(
            where={"id": cart.id},
            data={
                "coupon_id": None,
                "discount_amount": 0.0,
                "total": cart.subtotal + cart.tax + cart.shipping_fee
            }
        )

        return updated_cart

    async def increment_coupon_usage(self, coupon_id: int, user_id: int, discount_amount: float):
        """
        Increment coupon usage count. Called when order is placed.
        """
        user = await db.user.find_unique(
            where={"id": user_id}
        )
        async with db.tx() as tx:
            await tx.coupon.update(
                where={"id": coupon_id},
                data={"current_uses": {"increment": 1}}
            )
            await tx.couponusage.create(
                data={
                    "coupon_id": coupon_id,
                    "user_id": user_id,
                    "discount_amount": discount_amount,
                    "name": user.first_name + " " + user.last_name,
                    "email": user.email
                }
            )

