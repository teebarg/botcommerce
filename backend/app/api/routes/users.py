from typing import Any

from fastapi import APIRouter, HTTPException

from app.core.deps import (
    CurrentUser,
)
from app.models.order import OrderResponse
from app.models.wishlist import Wishlist, Wishlists
from app.models.message import Message
from app.models.user import UserUpdateMe, User
from app.models.wishlist import WishlistCreate
from app.prisma_client import prisma as db
from prisma.errors import PrismaError

# Create a router for users
router = APIRouter()


@router.get("/me")
# @cache(key="user", hash=False)
async def read_user_me(
    user: CurrentUser
):
    """Get current user with caching."""
    user = await db.user.find_unique(
        where={"id": user.id},
        include={"addresses": True}
    )
    return user
    # shipping_addresses = db.exec(
    #     select(Address).where(Address.user_id == user.id, Address.is_billing.is_(False))
    # ).all()

    # billing_address = db.exec(
    #     select(Address).where(Address.user_id == user.id, Address.is_billing)
    # ).first()

    # return User(**user.model_dump(), shipping_addresses=shipping_addresses, billing_address=billing_address)


@router.patch("/me")
async def update_user_me(
    user_in: UserUpdateMe,
    user: CurrentUser,
) -> Any:
    """
    Update own user.
    """
    if user_in.email:
        existing = await db.user.find_unique(
            where={
                "email": user_in.email, 
                "NOT": {
                    id: user.id
                }
            }
        )
        if not existing:
            raise HTTPException(status_code=404, detail="User with this email already exists")

    try:
        update = await db.user.update(
            where={"id": id},
            data=user_in.model_dump()
        )
        return update
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/wishlist")
# @cache(key="wishlist", hash=False)
async def read_wishlist(
    user: CurrentUser
) -> Wishlists:
    favorites = await db.favorite.find_many(
        where={"user_id": user.id},
        order={"created_at": "desc"},
        include={"product": True}
    )
    return favorites


@router.post("/wishlist", response_model=Wishlist)
async def create_user_wishlist_item(item: WishlistCreate, user: CurrentUser):
    try:
        favorite = await db.favorite.create(
            data={
                **item.model_dump(),
                "user_id": user.id
            }
        )
        return favorite
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    # result = crud.user.create_wishlist_item(db=db, item=item, user_id=user.id)
    # # Invalidate cache
    # cache.delete(f"wishlist:{user.id}")
    # return result


@router.delete("/wishlist/{product_id}", response_model=Message)
async def remove_wishlist_item(
    product_id: int,
    user: CurrentUser,
):
    existing = await db.favorite.find_unique(
        where={"product_id": product_id, "user_id": user.id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        await db.favorite.delete(
            where={"product_id": product_id, "user_id": user.id}
        )
        return Message(message="Product deleted successfully")
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/orders", response_model=list[OrderResponse])
async def get_user_orders(current_user: CurrentUser, skip: int = 0, take: int = 20):
    orders = await db.order.find_many(
        where={"user_id": current_user.id},
        skip=skip,
        take=take,
        order={"created_at": "desc"},
        include={"order_items": True}
    )
    return orders
