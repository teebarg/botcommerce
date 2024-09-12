from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from sqlalchemy.exc import IntegrityError
from sqlmodel import select

import crud
from core import deps
from core.deps import (
    SessionDep,
    get_current_active_superuser,
)
from core.logging import logger
from models.generic import OrderItem, OrderItemPublic
from models.message import Message
from models.order_item import OrderItemUpdate
from services.export import export

# Create a router for order_items
router = APIRouter()


@router.get("/{id}", response_model=OrderItemPublic)
def read(id: int, db: SessionDep) -> OrderItemPublic:
    """
    Get a specific order_item by id.
    """
    order_item = crud.order_item.get(db=db, id=id)
    if not order_item:
        raise HTTPException(status_code=404, detail="Order item not found")
    return order_item


@router.patch(
    "/{id}",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=OrderItemPublic,
)
def update(
    *,
    db: SessionDep,
    id: int,
    update_data: OrderItemUpdate,
) -> OrderItemPublic:
    """
    Update a order_item.
    """
    db_order_item = crud.order_item.get(db=db, id=id)
    if not db_order_item:
        raise HTTPException(
            status_code=404,
            detail="Order item not found",
        )

    try:
        db_order_item = crud.order_item.update(
            db=db, db_obj=db_order_item, obj_in=update_data
        )
        return db_order_item
    except IntegrityError as e:
        logger.error(f"Error updating tag - ${e.orig.pgerror}")
        raise HTTPException(status_code=422, detail=str(e.orig.pgerror)) from e
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400,
            detail=str(e),
        ) from e


@router.delete("/{id}", dependencies=[Depends(get_current_active_superuser)])
def delete(db: SessionDep, id: int) -> Message:
    """
    Delete a order_item.
    """
    try:
        order_item = crud.order_item.get(db=db, id=id)
        if not order_item:
            raise HTTPException(status_code=404, detail="Order item not found")
        crud.order_item.remove(db=db, id=id)
        return Message(message="Order item deleted successfully")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        ) from e


@router.post("/export", dependencies=[Depends(get_current_active_superuser)])
async def export_order_items(
    current_user: deps.CurrentUser, db: SessionDep, bucket: deps.Storage
):
    try:
        order_items = db.exec(select(OrderItem))
        file_url = await export(
            data=order_items, name="OrderItem", bucket=bucket, email=current_user.email
        )

        return {"message": "Data Export successful", "file_url": file_url}
    except Exception as e:
        logger.error(f"Export order items error: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e
