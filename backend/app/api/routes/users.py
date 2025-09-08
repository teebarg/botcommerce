from typing import Any, Optional
from fastapi import APIRouter, HTTPException, Query, Depends, Request
from pydantic import BaseModel, Field

from app.core.deps import (
    CurrentUser,
    get_current_superuser, RedisClient
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
from app.core.security import verify_password, get_password_hash
from app.services.recently_viewed import RecentlyViewedService
from app.models.product import SearchProduct
from app.services.redis import cache_response

router = APIRouter()

class PasswordChange(BaseModel):
    old_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


@router.get("/get-user")
async def get_user(
    email: str,
):
    user = await db.user.find_first(
        where={
            "email": email,
        }
    )
    return user


@router.get("/me")
async def read_user_me(
    user: CurrentUser
):
    """Get current user with caching."""
    return user


@router.patch("/me")
async def update_user_me(
    user_in: UserUpdateMe,
    user: CurrentUser,
) -> Any:
    """
    Update own user.
    """
    # Check if email is being updated and if it's already taken
    if user_in.email:
        existing = await db.user.find_unique(
            where={
                "email": user_in.email,
                "NOT": {
                    "id": user.id
                }
            }
        )
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

    try:
        # Update user with provided fields
        update = await db.user.update(
            where={"id": user.id},
            data=user_in.model_dump(exclude_unset=True)
        )
        return update
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/")
async def index(
    query: str = "",
    role: Optional[Role] = None,
    status: Optional[Status] = None,
    sort: Optional[str] = "desc",
    skip: int = Query(default=0, ge=0),
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
        skip=skip,
        take=limit,
        order={"created_at": sort},
        include={"orders": True}
    )
    total = await db.user.count(where=where_clause)
    return {
        "users":users,
        "skip":skip,
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


@router.get("/wishlist")
async def read_wishlist(
    user: CurrentUser
) -> Wishlists:
    favorites = await db.favorite.find_many(
        where={"user_id": user.id},
        order={"created_at": "desc"},
        include={"product": {"include" : {"images": True}}}
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
        where={
            'user_id_product_id': {
                'user_id': user.id,
                'product_id': product_id
            }
        }
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        await db.favorite.delete(
            where={
                'user_id_product_id': {
                    'user_id': user.id,
                    'product_id': product_id
                }
            }
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


@router.post("/change-password", response_model=Message)
async def change_password(
    password_data: PasswordChange,
    current_user: CurrentUser,
) -> Message:
    """
    Change user's password.
    """
    # Verify old password
    if not verify_password(password_data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Incorrect password"
        )

    try:
        # Update password
        await db.user.update(
            where={"id": current_user.id},
            data={"hashed_password": get_password_hash(password_data.new_password)}
        )
        return Message(message="Password updated successfully")
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/recently-viewed")
@cache_response(key_prefix="recently_viewed", key=lambda request, current_user, redis, limit: f"{current_user.id}:{limit}")
async def get_recently_viewed(
    request: Request,
    current_user: CurrentUser,
    redis: RedisClient,
    limit: int = Query(default=10, le=20)
) -> list[SearchProduct]:
    """Get current user's recently viewed products."""
    service = RecentlyViewedService(cache=redis)
    products = await service.get_recently_viewed(current_user.id, limit)
    return products
