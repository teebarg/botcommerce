from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)
from sqlalchemy.exc import IntegrityError
from sqlmodel import func, select

from app.core import crud
from app.core.decorators import cache
from app.core.deps import (
    CacheService,
    CurrentAddress,
    CurrentUser,
    SessionDep,
    get_address_param,
    get_current_user,
)
from app.core.logging import logger
from app.models.address import (
    AddressCreate,
    AddressUpdate,
)
from app.models.address import Address, Addresses, AddressPublic
from app.models.message import Message

# Create a router for addresses
router = APIRouter()


@router.get("/", dependencies=[Depends(get_current_user)])
@cache(key="addresses")
async def index(
    db: SessionDep,
    current_user: CurrentUser,
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> Addresses:
    """
    Retrieve addresses.
    """
    query = {}
    if not current_user.is_superuser:
        query.update({"user_id": current_user.id})
    count_statement = select(func.count()).select_from(Address)
    count_statement = crud.address.generate_statement(
        statement=count_statement, query=query
    )
    total_count = db.exec(count_statement).one()

    addresses = crud.address.get_multi(
        db=db,
        query=query,
        limit=limit,
        offset=(page - 1) * limit,
    )

    total_pages = (total_count // limit) + (total_count % limit > 0)

    return Addresses(
        addresses=addresses,
        page=page,
        limit=limit,
        total_pages=total_pages,
        total_count=total_count,
    )


@router.post("/", dependencies=[Depends(get_current_user)])
async def create(
    *, db: SessionDep, current_user: CurrentUser, create_data: AddressCreate, cache: CacheService
) -> AddressPublic:
    """
    Create new address.
    """
    address = crud.address.create(db=db, obj_in=create_data, user_id=current_user.id)
    cache.invalidate("addresses")
    return address


@router.get("/{id}")
@cache(key="address")
async def read(address: CurrentAddress) -> AddressPublic:
    """
    Get a specific address by id.
    """
    return address


@router.post("/billing_address", dependencies=[Depends(get_current_user)])
async def set_billing_address(db: SessionDep, user: CurrentUser, address: AddressCreate) -> AddressPublic:
    # Check if the user already has a billing address
    existing_address = db.exec(
        select(Address).where(Address.user_id == user.id, Address.is_billing)
    ).first()

    if existing_address:
        # Update the existing billing address with the new data
        existing_address.is_billing = True
        db_address = crud.address.update(db=db, db_obj=existing_address, obj_in=address)
        return db_address

    address.is_billing = True
    address = crud.address.create(db=db, obj_in=address, user_id=user.id)
    return address


@router.patch("/{id}", dependencies=[Depends(get_address_param)])
async def update(
    *,
    db: SessionDep,
    cache: CacheService,
    address: CurrentAddress,
    update_data: AddressUpdate,
) -> AddressPublic:
    """
    Update a address.
    """
    try:
        address = crud.address.update(db=db, db_obj=address, obj_in=update_data)
        # Invalidate cache
        cache.delete(f"address:{id}")
        cache.invalidate("addresses")
        return address
    except IntegrityError as e:
        logger.error(f"Error updating address, ${e.orig.pgerror}")
        raise HTTPException(status_code=422, detail=str(e.orig.pgerror)) from e
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400,
            detail=str(e),
        ) from e


@router.delete("/{id}", dependencies=[Depends(get_address_param)])
async def delete(id: int, db: SessionDep, cache: CacheService) -> Message:
    """
    Delete a address.
    """
    try:
        crud.address.remove(db=db, id=id)
        # Invalidate cache
        cache.delete(f"address:{id}")
        cache.invalidate("addresses:*")
        return Message(message="Address deleted successfully")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        ) from e
