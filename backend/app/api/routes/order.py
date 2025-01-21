from typing import Any

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from firebase_cart import FirebaseConfig, Order, OrderHandler
from sqlmodel import select, SQLModel

from app.core.config import settings
from app.core.deps import (
    CacheService,
    CurrentUser,
    Notification,
    SessionDep,
    Storage,
    get_current_active_superuser,
    get_current_user,
)
from app.core.decorators import cache
from app.core.logging import logger
from app.core.utils import generate_invoice_email
from app.models.generic import OrderDetails
from app.models.message import Message
from app.services.export import export

firebase_config = FirebaseConfig(
    credentials=settings.FIREBASE_CRED,
    database_url=settings.DATABASE_URL,
    bucket=settings.STORAGE_BUCKET,
)

order_handler = OrderHandler(firebase_config)

# Create a router for orders
router = APIRouter()

class Orders(SQLModel):
    orders: list[Any]


@router.get("/", dependencies=[Depends(get_current_user)])
@cache(key="orders")
async def index(user: CurrentUser) -> Orders:
    """
    Retrieve orders.
    """
    orders = order_handler.get_orders(user_id=user.id)
    return Orders(orders=orders)


@router.get("/admin/all", dependencies=[Depends(get_current_active_superuser)])
@cache(key="orders")
async def admin_index(
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> Any:
    """
    Retrieve orders.
    """
    return order_handler.get_paginated_orders(page=page, limit=limit)


@router.post("/", dependencies=[Depends(get_current_user)])
async def create(
    *,
    user: CurrentUser,
    cartId: str = Header(default=None),
    notification: Notification,
    cache: CacheService
) -> Order:
    """
    Create new order.
    """
    order_details = order_handler.create_order(cart_id=cartId, user_id=user.id)

    # Invalidate cache
    cache.invalidate("orders")

    # Send invoice email
    email_data = generate_invoice_email(order=order_details.get("order", {}), user=user)
    notification.send_notification(
        channel_name="email",
        recipient="neyostica2000@yahoo.com",
        subject=email_data.subject,
        message=email_data.html_content
    )

    # Send to slack
    slack_message = {
        "text": f"🛍️ *New Order Created* 🛍️\n"
                f"*Order ID:* {order_details.get('order', {}).get('order_id')}\n"
                f"*Customer:* {user.firstname} {user.lastname}\n"
                f"*Email:* {user.email}\n"
                f"*Amount:* ${order_details.get('order', {}).get('total', 0)}\n"
                f"*Payment Status:* ${order_details.get('order', {}).get('payment_status', 0)}"
    }

    notification.send_notification(
        channel_name="slack",
        slack_message=slack_message
    )

    return order_details.get("order", {})


@router.get("/{id}", dependencies=[Depends(get_current_user)])
@cache(key="order", hash=False)
async def read(id: str, user: CurrentUser) -> Any:
    """
    Get a specific order by order_number.
    """

    if not user:
        return {"message": "User details not found"}

    return order_handler.get_order(
        order_id=id, user_id=user.id, is_admin=user.is_superuser
    )


@router.patch("/{id}", dependencies=[Depends(get_current_active_superuser)])
async def update(
    id: str,
    update_data: OrderDetails,
    cache: CacheService
) -> Message:
    """
    Update a order.
    """
    res = order_handler.update_order(
        order_id=id, update_data=update_data, is_admin=True
    )
    # Invalidate cache
    cache.delete(f"order:{id}")
    cache.invalidate("orders")
    return res


@router.post("/export")
async def export_orders(
    current_user: CurrentUser, db: SessionDep, bucket: Storage
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
