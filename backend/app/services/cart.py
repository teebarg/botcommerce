from typing import Optional
from app.prisma_client import prisma as db
from prisma.enums import CartStatus
from app.models.cart import Cart

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