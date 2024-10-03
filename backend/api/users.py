from fastapi import (
    APIRouter,
)
from sqlmodel import select

from core.deps import (
    CurrentUser,
    SessionDep,
)
from models.generic import Address, UserPublic

# Create a router for users
router = APIRouter()


@router.get("/me")
async def read_user_me(db: SessionDep, user: CurrentUser) -> UserPublic:
    """
    Get current user.
    """
    # Retrieve shipping addresses
    shipping_addresses = db.exec(
        select(Address).where(
            Address.user_id == user.id, Address.is_billing == False
        )
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
