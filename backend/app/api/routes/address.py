from fastapi import (
    APIRouter,
    HTTPException,
    Request
)
from app.core.deps import CurrentUser
from app.models.address import (
    Address,
    Addresses,
    AddressCreate,
    AddressUpdate,
)
from app.models.generic import Message
from app.prisma_client import prisma as db
from prisma.errors import PrismaError
from app.core.logging import get_logger
from app.services.redis import cache_response, invalidate_key, invalidate_pattern

logger = get_logger(__name__)

router = APIRouter()


@router.get("/")
@cache_response("addresses", key=lambda request, user: user.id)
async def index(
    request: Request,
    user: CurrentUser
) -> Addresses:
    """Get current user addresses."""
    addresses = await db.address.find_many(
        where={"user_id": user.id},
        order={"created_at": "desc"}
    )
    address_list = [address.dict() for address in addresses]
    return {"addresses": address_list}


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
                "user": {"connect": {"id": user.id}},
            }
        )
        await invalidate_key(f"addresses:{user.id}")
        return address
    except PrismaError as e:
        logger.error(e)
        raise HTTPException(
            status_code=400, detail=f"Database error: {str(e)}")


@router.get("/{id}")
@cache_response("address", key=lambda request, id, user: id)
async def read(request: Request, id: int, user: CurrentUser) -> Address:
    """
    Get a specific address by id.
    """
    address = await db.address.find_unique(
        where={"id": id, "user_id": user.id}
    )
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    return address


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
        await invalidate_key(f"addresses:{user.id}")
        await invalidate_key(f"address:{id}")
        return update
    except PrismaError as e:
        raise HTTPException(
            status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{id}")
async def delete(id: int, user: CurrentUser) -> Message:
    """
    Delete a address.
    """
    existing = await db.address.find_unique(
        where={"id": id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Address not found")

    if not user.role == "ADMIN" and user.id != existing.user_id:
        raise HTTPException(
            status_code=401, detail="Unauthorized to delete this address."
        )

    try:
        async with db.tx() as tx:
            cart = await tx.cart.find_first(where={"shipping_address_id": id, "status": "ACTIVE"})
            if cart:
                await tx.cart.update(
                    where={"id": cart.id},
                    data={
                        "shipping_address": { "disconnect": {"id": id}},
                        "billing_address": { "disconnect": {"id": id}}
                    }
                )
                
            await tx.address.delete(where={"id": id})

        await invalidate_pattern("cart")
        await invalidate_key(f"addresses:{user.id}")
        await invalidate_key(f"address:{id}")
        
        return Message(message="Address deleted successfully")
    except PrismaError as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))
