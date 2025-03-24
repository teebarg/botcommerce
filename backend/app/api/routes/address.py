from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from app.core.deps import CurrentUser
from app.core.logging import logger
from app.models.address import (
    AddressCreate,
    AddressUpdate,
    BillingAddressCreate
)
from app.models.address import Address, Addresses
from app.models.generic import Message
from app.prisma_client import prisma as db
from math import ceil
from prisma.errors import PrismaError

# Create a router for addresses
router = APIRouter()


@router.get("/")
# @cache(key="addresses")
async def index(
    current_user: CurrentUser,
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> Addresses:
    """
    Retrieve addresses.
    """
    where_clause = None
    if not current_user.role == "ADMIN":
        where_clause = {
            "user_id": current_user.id
        }
    addresses = await db.address.find_many(
        where=where_clause,
        skip=(page - 1) * limit,
        take=limit,
        order={"created_at": "desc"},
    )
    total = await db.address.count(where=where_clause)
    return {
        "addresses": addresses,
        "page": page,
        "limit": limit,
        "total_pages": ceil(total/limit),
        "total_count": total,
    }


@router.post("/")
async def create(
    *, user: CurrentUser, create_data: AddressCreate
) -> Address:
    """
    Create new address.
    """
    try:
        address = await db.address.create(
            data={
                **create_data.model_dump(),
                "user_id": user.id
            }
        )
        return address
    except PrismaError as e:
        raise HTTPException(
            status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{id}")
# @cache(key="address")
async def read(id: int, user: CurrentUser) -> Address:
    """
    Get a specific address by id.
    """
    address = await db.address.find_unique(
        where={"id": id, "user_id": user.id}
    )
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    return address


@router.post("/billing")
async def set_billing_address(user: CurrentUser, address: BillingAddressCreate) -> Address:
    # address = await db.address.upsert(
    #     where={"id": existing_address.id if existing_address else -1},  # Use ID if found
    #     update={**address.model_dump(exclude={"id", "user"})},  # Update only valid fields
    #     create={**address.model_dump(), "user_id": user.id, "is_billing": True}  # Create new if not found
    # )
    update_data = address.dict(exclude_unset=True)

    try:
        address = await db.address.find_first(
            where={"user_id": user.id, "is_billing": True}
        )
        if address:
            update = await db.address.update(
                where={"id": address.id},
                data={
                    **update_data,
                    "is_billing": True,
                    "user": {"connect": {"id": user.id}},
                }
            )
            return update

        address = await db.address.create(
            data={
                **update_data,
                "user_id": user.id,
                "is_billing": True
            }
        )
        return address
    except PrismaError as e:
        raise HTTPException(
            status_code=500, detail=f"Database error: {str(e)}")


@router.patch("/{id}")
async def update(
    id: int,
    user: CurrentUser,
    update: AddressUpdate,
) -> Address:
    """
    Update a address.
    """
    existing = await db.address.find_unique(
        where={"id": id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Address not found")

    update_data = update.dict(exclude_unset=True)

    if not user.role == "ADMIN" and user.id != existing.user_id:
        raise HTTPException(
            status_code=401, detail="Unauthorized to access this address."
        )

    try:
        update = await db.address.update(
            where={"id": id},
            data={
                **update_data
            }
        )
        return update
    except PrismaError as e:
        raise HTTPException(
            status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{id}")
async def delete(id: int) -> Message:
    """
    Delete a address.
    """
    existing = await db.address.find_unique(
        where={"id": id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Address not found")

    try:
        await db.address.delete(
            where={"id": id}
        )
        return Message(message="Address deleted successfully")
    except PrismaError as e:
        raise HTTPException(
            status_code=500, detail=f"Database error: {str(e)}")
