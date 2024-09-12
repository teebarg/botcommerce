from typing import Annotated, Union

from fastapi import (
    APIRouter,
    Cookie,
    Depends,
    HTTPException,
    Query,
)
from sqlalchemy.exc import IntegrityError
from sqlmodel import func, select

import crud
from core import deps
from core.deps import (
    CurrentOrder,
    CurrentUser,
    SessionDep,
    get_current_user,
    get_order_path_param,
)
from core.logging import logger
from core.utils import generate_invoice_email, send_email
from models.generic import CartItem, Order, OrderItem, OrderPublic, Orders
from models.message import Message
from models.order import (
    OrderCreate,
    OrderUpdate,
)
from services.export import export

# Create a router for orders
router = APIRouter()


@router.get(
    "/",
    dependencies=[Depends(get_current_user)],
    response_model=Orders,
)
def index(
    db: SessionDep,
    current_user: CurrentUser,
    page: int = Query(default=1, gt=0),
    per_page: int = Query(default=20, le=100),
) -> Orders:
    """
    Retrieve orders.
    """
    query = {}
    if not current_user.is_superuser:
        query.update({"user_id": current_user.id})
    count_statement = select(func.count()).select_from(Order)
    count_statement = crud.order.generate_statement(
        statement=count_statement, query=query
    )
    total_count = db.exec(count_statement).one()

    orders = crud.order.get_multi(
        db=db,
        query=query,
        per_page=per_page,
        offset=(page - 1) * per_page,
    )

    total_pages = (total_count // per_page) + (total_count % per_page > 0)

    return Orders(
        orders=orders,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
        total_count=total_count,
    )


@router.post("/", dependencies=[Depends(get_current_user)], response_model=OrderPublic)
def create(
    *,
    db: SessionDep,
    create_data: OrderCreate,
    current_user: CurrentUser,
    session_id: Annotated[Union[str, None], Cookie()] = None,
) -> OrderPublic:
    """
    Create new order.
    """
    if not session_id:
        raise HTTPException(status_code=404, detail="Cart not found")

    cart = crud.cart.get_by_key(db=db, key="session_id", value=session_id)
    if not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    order = crud.order.create(db=db, obj_in=create_data, user_id=current_user.id)

    for item in cart.items:
        print(item.product)
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.product.price,
        )
        db.add(order_item)
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()

    # Send download link
    email_data = generate_invoice_email(order=order, user=current_user)
    send_email(
        email_to="neyostica2000@yahoo.com",
        subject=email_data.subject,
        html_content=email_data.html_content,
    )

    return order


@router.get("/{order_number}", dependencies=[], response_model=OrderPublic)
def read(order: CurrentOrder) -> OrderPublic:
    """
    Get a specific order by order_number.
    """
    return order


@router.patch(
    "/{id}",
    dependencies=[],
    response_model=OrderPublic,
)
def update(
    *,
    db: SessionDep,
    db_order: CurrentOrder,
    update_data: OrderUpdate,
) -> OrderPublic:
    """
    Update a order.
    """
    try:
        db_order = crud.order.update(db=db, db_obj=db_order, obj_in=update_data)
        return db_order
    except IntegrityError as e:
        logger.error(f"Error updating tag, {e.orig.pgerror}")
        raise HTTPException(status_code=422, detail=str(e.orig.pgerror)) from e
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400,
            detail=str(e),
        ) from e


@router.delete("/{id}", dependencies=[Depends(get_order_path_param)])
def delete(db: SessionDep, id: int) -> Message:
    """
    Delete a order.
    """
    try:

        crud.order.remove(db=db, id=id)
        return Message(message="Order deleted successfully")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        ) from e


@router.post("/export")
async def export_orders(
    current_user: deps.CurrentUser, db: SessionDep, bucket: deps.Storage
):
    try:
        orders = db.exec(select(Order))
        file_url = await export(
            data=orders, name="Order", bucket=bucket, email=current_user.email
        )

        return {"message": "Data Export successful", "file_url": file_url}
    except Exception as e:
        logger.error(f"Export orders error: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e
