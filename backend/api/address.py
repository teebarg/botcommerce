from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)
from sqlalchemy.exc import IntegrityError
from sqlmodel import func, select

import crud
from core.deps import (
    CurrentAddress,
    CurrentUser,
    SessionDep,
    get_address_param,
    get_current_user,
)
from core.logging import logger
from models.address import (
    AddressCreate,
    AddressUpdate,
)
from models.generic import Address, Addresses, AddressPublic
from models.message import Message

# Create a router for addresses
router = APIRouter()


@router.get(
    "/",
    dependencies=[Depends(get_current_user)],
    response_model=Addresses,
)
def index(
    db: SessionDep,
    current_user: CurrentUser,
    page: int = Query(default=1, gt=0),
    per_page: int = Query(default=20, le=100),
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
        per_page=per_page,
        offset=(page - 1) * per_page,
    )

    total_pages = (total_count // per_page) + (total_count % per_page > 0)

    return Addresses(
        addresses=addresses,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
        total_count=total_count,
    )


@router.post(
    "/", dependencies=[Depends(get_current_user)], response_model=AddressPublic
)
def create(
    *, db: SessionDep, current_user: CurrentUser, create_data: AddressCreate
) -> AddressPublic:
    """
    Create new address.
    """
    address = crud.address.create(db=db, obj_in=create_data, user_id=current_user.id)
    return address


@router.get("/{id}", response_model=AddressPublic)
def read(address: CurrentAddress) -> AddressPublic:
    """
    Get a specific address by id.
    """
    return address


@router.patch(
    "/{id}",
    dependencies=[Depends(get_address_param)],
    response_model=AddressPublic,
)
def update(
    *,
    db: SessionDep,
    db_address: CurrentAddress,
    update_data: AddressUpdate,
) -> AddressPublic:
    """
    Update a address.
    """
    try:
        db_address = crud.address.update(db=db, db_obj=db_address, obj_in=update_data)
        return db_address
    except IntegrityError as e:
        logger.error(f"Error updating tag, ${e.orig.pgerror}")
        raise HTTPException(status_code=422, detail=str(e.orig.pgerror)) from e
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400,
            detail=str(e),
        ) from e


@router.delete("/{id}", dependencies=[Depends(get_address_param)])
def delete(db: SessionDep, id: int) -> Message:
    """
    Delete a address.
    """
    try:
        crud.address.remove(db=db, id=id)
        return Message(message="Address deleted successfully")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        ) from e
