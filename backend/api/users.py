from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import select

import crud
from core.deps import (
    CurrentUser,
    SessionDep,
)
from models.generic import Address, UserPublic, Wishlist
from models.message import Message
from models.user import UserUpdateMe
from models.wishlist import WishlistCreate

# Create a router for users
router = APIRouter()


@router.get("/me")
async def read_user_me(db: SessionDep, user: CurrentUser) -> UserPublic:
    """
    Get current user.
    """
    # Retrieve shipping addresses
    shipping_addresses = db.exec(
        select(Address).where(Address.user_id == user.id, Address.is_billing.is_(False))
    ).all()

    # Retrieve billing address
    billing_address = db.exec(
        select(Address).where(Address.user_id == user.id, Address.is_billing)
    ).first()

    return {
        **user.model_dump(),
        "shipping_addresses": shipping_addresses,
        "billing_address": billing_address,
    }


@router.patch("/me", response_model=UserPublic)
def update_user_me(
    *, session: SessionDep, user_in: UserUpdateMe, current_user: CurrentUser
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
    return current_user


@router.get("/wishlist", response_model=list[Wishlist])
def read_user_wishlist(db: SessionDep, user: CurrentUser):
    return crud.user.get_user_wishlist(db=db, user_id=user.id)


@router.post("/wishlist", response_model=Wishlist)
def create_user_wishlist_item(item: WishlistCreate, db: SessionDep, user: CurrentUser):
    return crud.user.create_wishlist_item(db=db, item=item, user_id=user.id)


@router.delete("/wishlist/{product_id}", response_model=Message)
def remove_user_wishlist_item(product_id: int, db: SessionDep, user: CurrentUser):
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
    return Message(message="Item deleted successfully")
