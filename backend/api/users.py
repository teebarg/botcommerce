from backend import crud
from models.wishlist import WishlistCreate
from fastapi import (
    APIRouter,
)
from sqlmodel import select

from core.deps import (
    CurrentUser,
    SessionDep,
)
from models.generic import Address, UserPublic, Wishlist

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

@router.get("/users/{user_id}/wishlist", response_model=list[Wishlist])
def read_user_wishlist(user_id: int, db: SessionDep):
    return crud.user.get_user_wishlist(db, user_id)

@router.post("/users/{user_id}/wishlist", response_model=Wishlist)
def create_user_wishlist_item(user_id: int, item: WishlistCreate, db: SessionDep):
    return crud.user.create_wishlist_item(db, item, user_id)
