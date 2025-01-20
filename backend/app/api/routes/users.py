from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import select, SQLModel
from sqlalchemy.exc import IntegrityError

from app.core.decorators import cache
from app.core import crud
from app.core.deps import (
    CacheService,
    CurrentUser,
    SessionDep,
)

from app.models.generic import Address, UserPublic, Wishlist
from app.models.message import Message
from app.models.user import UserUpdateMe
from app.models.wishlist import WishlistCreate, Wishlists
from app.core.logging import logger

# Create a router for users
router = APIRouter()


@router.get("/me")
@cache(key="user")
async def read_user_me(
    db: SessionDep,
    user: CurrentUser
) -> UserPublic:
    """Get current user with caching."""
    shipping_addresses = db.exec(
        select(Address).where(Address.user_id == user.id, Address.is_billing.is_(False))
    ).all()

    billing_address = db.exec(
        select(Address).where(Address.user_id == user.id, Address.is_billing)
    ).first()

    return UserPublic(**user.model_dump(), shipping_addresses=shipping_addresses, billing_address=billing_address)


@router.patch("/me", response_model=UserPublic)
async def update_user_me(
    *,
    db: SessionDep,
    user_in: UserUpdateMe,
    current_user: CurrentUser,
    cache: CacheService,
) -> Any:
    """
    Update own user.
    """

    if user_in.email:
        existing_user = crud.user.get_by_email(db=db, email=user_in.email)
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=409, detail="User with this email already exists"
            )
        
    try:
        user = crud.user.update(
            db=db, db_obj=current_user, obj_in=user_in
        )
        # Invalidate cache
        cache.delete(f"user:{user.id}")
        cache.delete(f"user:{user.email}")
        return user
    except IntegrityError as e:
        logger.error(f"Error updating user, {e.orig.pgerror}")
        raise HTTPException(status_code=422, detail=str(e.orig.pgerror)) from e
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400,
            detail=f"{e}",
        ) from e


@router.get("/wishlist")
@cache(key="wishlist")
async def read_wishlist(
    db: SessionDep,
    user: CurrentUser
) -> Wishlists:
    results = crud.user.get_user_wishlist(db=db, user_id=user.id)
    return Wishlists(wishlists=results)


@router.post("/wishlist", response_model=Wishlist)
def create_user_wishlist_item(item: WishlistCreate, db: SessionDep, user: CurrentUser):
    return crud.user.create_wishlist_item(db=db, item=item, user_id=user.id)


@router.delete("/wishlist/{product_id}", response_model=Message)
async def remove_wishlist_item(
    product_id: int,
    db: SessionDep,
    user: CurrentUser,
    cache: CacheService,
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
    cache.delete("wishlist")

    return Message(message="Item deleted successfully")
