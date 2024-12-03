from fastapi import APIRouter, HTTPException
from sqlmodel import select

import crud
from core.deps import (
    CurrentUser,
    SessionDep,
)
from models.generic import Address, UserPublic, Wishlist
from models.message import Message
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
