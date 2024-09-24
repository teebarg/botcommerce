from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from firebase_cart import FirebaseConfig, Order, OrderHandler
from sqlmodel import select

from core import deps
from core.config import settings
from core.deps import (
    CurrentUser,
    SessionDep,
    get_current_active_superuser,
    get_current_user,
)
from core.logging import logger
from core.utils import generate_invoice_email, send_email
from models.generic import OrderDetails
from models.message import Message
from services.export import export

firebase_config = FirebaseConfig(
    credentials=settings.FIREBASE_CRED,
    database_url=settings.DATABASE_URL,
    bucket=settings.STORAGE_BUCKET,
)

order_handler = OrderHandler(firebase_config)

# Create a router for orders
router = APIRouter()


@router.get("/", dependencies=[Depends(get_current_user)])
def index(user: CurrentUser) -> list[Order]:
    """
    Retrieve orders.
    """
    orders = order_handler.get_orders(user_id=user.id)
    return orders


@router.get("/admin/all", dependencies=[Depends(get_current_active_superuser)])
def admin_index(
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> Any:
    """
    Retrieve orders.
    """
    orders = order_handler.get_paginated_orders(page=page, limit=limit)
    return orders


@router.post("/", dependencies=[Depends(get_current_user)])
def create(*, user: CurrentUser, cartId: str = Header(default=None)) -> Order:
    """
    Create new order.
    """
    order_details = order_handler.create_order(cart_id=cartId, user_id=user.id)

    # Send invoice link
    email_data = generate_invoice_email(order=order_details.get("order", {}), user=user)
    send_email(
        email_to="neyostica2000@yahoo.com",
        subject=email_data.subject,
        html_content=email_data.html_content,
    )

    return order_details.get("order", {})


@router.get("/{order_id}", dependencies=[])
def read(order_id: str, user: CurrentUser) -> Any:
    """
    Get a specific order by order_number.
    """

    if not user:
        return {"message": "User details not found"}

    order_details = order_handler.get_order(
        order_id=order_id, user_id=user.id, is_admin=user.is_superuser
    )

    return order_details


@router.patch("/{id}", dependencies=[Depends(get_current_active_superuser)])
def update(
    *,
    id: str,
    update_data: OrderDetails,
) -> Message:
    """
    Update a order.
    """
    res = order_handler.update_order(
        order_id=id, update_data=update_data, is_admin=True
    )
    return res


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
