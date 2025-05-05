from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query, Depends

from app.core.deps import (
    CurrentUser,
    get_current_superuser
)
from app.models.order import OrderResponse
from app.models.wishlist import Wishlist, Wishlists, WishlistCreate
from app.models.generic import Message
from app.models.user import UserUpdateMe, UserUpdate
from app.prisma_client import prisma as db
from prisma.errors import PrismaError
from prisma.enums import Role, Status
from prisma.models import User
from math import ceil

# Create a router for users
router = APIRouter()


@router.get("/me")
async def read_user_me(
    user: CurrentUser
):
    """Get current user with caching."""
    return user


@router.get("/")
async def index(
    query: str = "",
    role: Optional[Role] = None,
    status: Optional[Status] = None,
    sort: Optional[str] = "desc",
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
):
    """
    Retrieve users with Redis caching.
    """
    where_clause = None
    if query:
        where_clause = {
            "OR": [
                {"first_name": {"contains": query, "mode": "insensitive"}},
                {"last_name": {"contains": query, "mode": "insensitive"}}
            ]
        }
    if role:
        where_clause = where_clause or {}
        where_clause["role"] = role
    if status:
        where_clause = where_clause or {}
        where_clause["status"] = status

    users = await db.user.find_many(
        where=where_clause,
        skip=(page - 1) * limit,
        take=limit,
        order={"createdAt": sort},
        include={"orders": True}
    )
    total = await db.user.count(where=where_clause)
    return {
        "users":users,
        "page":page,
        "limit":limit,
        "total_pages":ceil(total/limit),
        "total_count":total,
    }


@router.patch("/{id}", dependencies=[Depends(get_current_superuser)])
async def update(
    *,
    id: int,
    update_data: UserUpdate,
) -> User:
    """
    Update a user.
    """
    existing = await db.user.find_unique(
        where={"id": id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        update = await db.user.update(
            where={"id": id},
            data=update_data.model_dump(exclude_unset=True)
        )
        return update
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{id}", dependencies=[Depends(get_current_superuser)])
async def delete(id: int) -> Message:
    """
    Delete a user.
    """
    existing = await db.user.find_unique(
        where={"id": id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        await db.user.delete(
            where={"id": id}
        )
        return Message(message="User deleted successfully")
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")



@router.get("/address")
async def read_user_address(
    user: CurrentUser
):
    """Get current user addresses."""
    addresses = await db.address.find_many(
        where={"user_id": user.id},
        order={"created_at": "desc"}
    )
    address_dicts = [address.dict() for address in addresses]
    return {"addresses": address_dicts}


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
async def read_wishlist(
    user: CurrentUser
) -> Wishlists:
    favorites = await db.favorite.find_many(
        where={"user_id": user.id},
        order={"created_at": "desc"},
        include={"product": {"include" : {"variants": True}}}
    )
    return {"wishlists": favorites}


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
