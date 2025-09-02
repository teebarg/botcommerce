from fastapi import (
    APIRouter,
    HTTPException,
    Query,
    Request
)

from app.core.deps import CurrentUser, RedisClient
from app.models.address import (
    AddressCreate,
    AddressUpdate,
)
from app.models.address import Address, Addresses
from app.models.generic import Message
from app.prisma_client import prisma as db
from math import ceil
from prisma.errors import PrismaError
from app.core.logging import get_logger
from app.services.redis import cache_response

logger = get_logger(__name__)

router = APIRouter()


@router.get("/")
@cache_response("addresses")
async def index(
    request: Request,
    current_user: CurrentUser,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
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
        skip=skip,
        take=limit,
        order={"created_at": "desc"},
    )
    total = await db.address.count(where=where_clause)
    return {
        "addresses": addresses,
        "skip": skip,
        "limit": limit,
        "total_pages": ceil(total/limit),
        "total_count": total,
    }


@router.post("/")
async def create(
    *, user: CurrentUser, create_data: AddressCreate, redis: RedisClient
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
        await redis.invalidate_list_cache("addresses")
        return address
    except PrismaError as e:
        logger.error(e)
        raise HTTPException(
            status_code=400, detail=f"Database error: {str(e)}")


@router.get("/{id}")
@cache_response("address", key=lambda request, id, user: f"{user.id}:{id}")
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
    redis: RedisClient,
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
        await redis.invalidate_list_cache("addresses")
        await redis.bust_tag(f"address:{user.id}:{id}")
        return update
    except PrismaError as e:
        raise HTTPException(
            status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{id}")
async def delete(id: int, user: CurrentUser, redis: RedisClient) -> Message:
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
        await db.address.delete(
            where={"id": id}
        )
        await redis.invalidate_list_cache("addresses")
        await redis.bust_tag(f"address:{user.id}:{id}")
        return Message(message="Address deleted successfully")
    except PrismaError as e:
        raise HTTPException(
            status_code=500, detail=f"Database error: {str(e)}")
