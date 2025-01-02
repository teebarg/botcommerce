from typing import Any
import json
from app.core import deps
from app.core.utils import custom_deserializer, custom_serializer
from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app import crud
from app.core.deps import (
    CurrentUser,
    SessionDep,
)
from app.models.generic import Address, UserPublic, Wishlist
from app.models.message import Message
from app.models.user import UserUpdateMe
from app.models.wishlist import WishlistCreate

# Create a router for users
router = APIRouter()


@router.get("/me")
async def read_user_me(
    db: SessionDep,
    user: CurrentUser,
    redis: deps.CacheService,
) -> UserPublic:
    """Get current user with caching."""
    # Try to get from cache first
    cache_key = f"user:{user.id}:profile"
    cached_data = redis.get(cache_key)

    if cached_data:
        return json.loads(cached_data, object_hook=custom_deserializer)

    # If not in cache, get from DB
    shipping_addresses = db.exec(
        select(Address).where(Address.user_id == user.id, Address.is_billing.is_(False))
    ).all()

    billing_address = db.exec(
        select(Address).where(Address.user_id == user.id, Address.is_billing)
    ).first()

    user_data = {
        **user.model_dump(),
        "shipping_addresses": [addr.model_dump() for addr in shipping_addresses],
        "billing_address": billing_address.model_dump() if billing_address else None,
    }

    # Cache the result
    redis.set(cache_key, json.dumps(user_data, default=custom_serializer))

    return user_data


@router.patch("/me", response_model=UserPublic)
async def update_user_me(
    *,
    session: SessionDep,
    user_in: UserUpdateMe,
    current_user: CurrentUser,
    redis: deps.CacheService,
) -> Any:
    """
    Update own user.
    """

    if user_in.email:
        existing_user = crud.get_user_by_email(session=session, email=user_in.email)
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )
    user_data = user_in.model_dump(exclude_unset=True)
    current_user.sqlmodel_update(user_data)
    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    # Invalidate user cache
    redis.delete(f"user:{current_user.id}:profile")
    redis.delete(f"user:email:{current_user.email}")

    return current_user


@router.get("/wishlist", response_model=list[Wishlist])
async def read_user_wishlist(
    db: SessionDep,
    user: CurrentUser,
    redis: deps.CacheService,
):
    # Try cache first
    cache_key = f"user:{user.id}:wishlist"
    cached_data = redis.get(cache_key)

    if cached_data:
        return json.loads(cached_data, object_hook=custom_deserializer)

    # Get from DB if not cached
    wishlist = crud.user.get_user_wishlist(db=db, user_id=user.id)

    # Cache the result
    redis.set(
        cache_key,
        json.dumps([item.model_dump() for item in wishlist], default=custom_serializer)
    )

    return wishlist


@router.post("/wishlist", response_model=Wishlist)
def create_user_wishlist_item(item: WishlistCreate, db: SessionDep, user: CurrentUser):
    return crud.user.create_wishlist_item(db=db, item=item, user_id=user.id)


@router.delete("/wishlist/{product_id}", response_model=Message)
async def remove_user_wishlist_item(
    product_id: int,
    db: SessionDep,
    user: CurrentUser,
    redis: deps.CacheService,
):
    wishlist_item = db.exec(
        select(Wishlist)
        .where(Wishlist.user_id == user.id)
        .where(Wishlist.product_id == product_id)
    ).first()
    if not wishlist_item:
        raise HTTPException(
            status_code=404, detail="Product not found or not owned by user"
        )
    db.delete(wishlist_item)
    db.commit()

    # Invalidate wishlist cache
    redis.delete(f"user:{user.id}:wishlist")

    return Message(message="Item deleted successfully")
