from fastapi import APIRouter, Depends, Header, HTTPException, Query, Response
# from firebase_cart import FirebaseConfig, Order, OrderHandler

from app.core.deps import (
    CurrentUser,
    Notification,
    Storage,
    get_current_superuser,
    get_current_user,
)
from app.core.logging import logger
from app.core.utils import generate_invoice_email
from app.services.export import export
from typing import Optional
import uuid
from app.prisma_client import prisma as db
from app.models.order import OrderCreate, OrderResponse, OrderStatus, OrderUpdate

# firebase_config = FirebaseConfig(
#     credentials=settings.FIREBASE_CRED,
#     database_url=settings.DATABASE_URL,
#     bucket=settings.STORAGE_BUCKET,
# )

# order_handler = OrderHandler(firebase_config)

# Create a router for orders
router = APIRouter()


@router.post("/", response_model=OrderResponse)
async def create_order(response: Response, notification: Notification, order: OrderCreate, cartId: str = Header(default=None)):
    # Generate unique order number
    order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"

    # Verify user and addresses exist
    user = await db.user.find_unique(where={"id": order.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    shipping_address = await db.address.find_unique(where={"id": order.shipping_address_id})
    if not shipping_address:
        raise HTTPException(
            status_code=404, detail="Shipping address not found")

    billing_address = await db.address.find_unique(where={"id": order.billing_address_id})
    if not billing_address:
        raise HTTPException(
            status_code=404, detail="Billing address not found")

    # Create order with items
    new_order = await db.order.create(
        data={
            "order_number": order_number,
            "user_id": order.user_id,
            "shipping_address_id": order.shipping_address_id,
            "billing_address_id": order.billing_address_id,
            "total": order.total,
            "subtotal": order.subtotal,
            "tax": order.tax,
            "shipping_fee": order.shipping_fee,
            "status": order.status,
            "payment_status": order.payment_status,
            "shipping_method": order.shipping_method,
            "coupon_id": order.coupon_id,
            "cart_id": cartId,
            "order_items": {
                "create": [
                    {
                        "variant_id": item.variant_id,
                        "quantity": item.quantity,
                        "price": item.price
                    } for item in order.order_items
                ]
            }
        },
        include={"order_items": True}
    )

    # Invalidate cart cookie
    response.delete_cookie(key="_cart_id")

    # Send invoice email
    email_data = generate_invoice_email(order=new_order, user=user)
    notification.send_notification(
        channel_name="email",
        recipient="neyostica2000@yahoo.com",
        subject=email_data.subject,
        message=email_data.html_content
    )

    # Send to slack
    slack_message = {
        "text": f"🛍️ *New Order Created* 🛍️\n"
                f"*Order ID:* {new_order.order_number}\n"
                f"*Customer:* {user.firstname} {user.lastname}\n"
                f"*Email:* {user.email}\n"
                f"*Amount:* ${new_order.total}\n"
                f"*Payment Status:* ${new_order.payment_status}"
    }

    notification.send_notification(
        channel_name="slack",
        slack_message=slack_message
    )
    return new_order


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int):
    """
    Get a specific order by order_number.
    """
    order = await db.order.find_unique(
        where={"id": order_id},
        include={
            "order_items": True,
            "user": True,
            "shipping_address": True,
            "billing_address": True
        }
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.get("/", response_model=list[OrderResponse], dependencies=[Depends(get_current_superuser)])
async def get_orders(
    skip: int = 0,
    take: int = 20,
    status: Optional[OrderStatus] = None,
    user_id: Optional[int] = None
):
    where = {}
    if status:
        where["status"] = status
    if user_id:
        where["user_id"] = user_id

    orders = await db.order.find_many(
        where=where,
        skip=skip,
        take=take,
        order={"created_at": "desc"},
        include={"order_items": True}
    )
    return orders


@router.put("/orders/{order_id}", dependencies=[Depends(get_current_superuser)], response_model=OrderResponse)
async def update_order(order_id: int, order_update: OrderUpdate):
    """
    Update a order.
    """
    order = await db.order.find_unique(where={"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    update_data = {}
    if order_update.status:
        update_data["status"] = order_update.status
    if order_update.payment_status:
        update_data["payment_status"] = order_update.payment_status
    if order_update.shipping_method:
        update_data["shipping_method"] = order_update.shipping_method
    if order_update.shipping_fee is not None:
        update_data["shipping_fee"] = order_update.shipping_fee

    updated_order = await db.order.update(
        where={"id": order_id},
        data=update_data,
        include={"order_items": True}
    )
    return updated_order


@router.delete("/{order_id}")
async def delete_order(order_id: int):
    order = await db.order.find_unique(where={"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    await db.order.delete(where={"id": order_id})
    return {"message": "Order deleted successfully"}


# @router.get("/", dependencies=[Depends(get_current_user)])
# @cache(key="orders")
# async def index(user: CurrentUser) -> Orders:
#     """
#     Retrieve orders.
#     """
#     orders = order_handler.get_orders(user_id=user.id)
#     return Orders(orders=orders)


# @router.get("/admin/all", dependencies=[Depends(get_current_superuser)])
# @cache(key="orders")
# async def admin_index(
#     page: int = Query(default=1, gt=0),
#     limit: int = Query(default=20, le=100),
# ) -> Any:
#     """
#     Retrieve orders.
#     """
#     return order_handler.get_paginated_orders(page=page, limit=limit)


# @router.post("/", dependencies=[Depends(get_current_user)])
# async def create(
#     *,
#     response: Response,
#     user: CurrentUser,
#     cartId: str = Header(default=None),
#     notification: Notification,
#     cache: CacheService
# ) -> Order:
#     """
#     Create new order.
#     """
#     order_details = order_handler.create_order(cart_id=cartId, user_id=user.id)

#     # Invalidate cache
#     cache.invalidate("orders")

#     # Invalidate cart cookie
#     response.delete_cookie(key="_cart_id")

#     # Send invoice email
#     email_data = generate_invoice_email(order=order_details.get("order", {}), user=user)
#     notification.send_notification(
#         channel_name="email",
#         recipient="neyostica2000@yahoo.com",
#         subject=email_data.subject,
#         message=email_data.html_content
#     )

#     # Send to slack
#     slack_message = {
#         "text": f"🛍️ *New Order Created* 🛍️\n"
#                 f"*Order ID:* {order_details.get('order', {}).get('order_id')}\n"
#                 f"*Customer:* {user.firstname} {user.lastname}\n"
#                 f"*Email:* {user.email}\n"
#                 f"*Amount:* ${order_details.get('order', {}).get('total', 0)}\n"
#                 f"*Payment Status:* ${order_details.get('order', {}).get('payment_status', 0)}"
#     }

#     notification.send_notification(
#         channel_name="slack",
#         slack_message=slack_message
#     )

#     return order_details.get("order", {})


# @router.get("/{id}", dependencies=[Depends(get_current_user)])
# @cache(key="order", hash=False)
# async def read(id: str, user: CurrentUser) -> Any:
#     """
#     Get a specific order by order_number.
#     """

#     if not user:
#         return {"message": "User details not found"}

#     return order_handler.get_order(
#         order_id=id, user_id=user.id, is_admin=user.is_superuser
#     )


# @router.patch("/{id}", dependencies=[Depends(get_current_superuser)])
# async def update(
#     id: str,
#     update_data: OrderDetails,
#     cache: CacheService
# ) -> Message:
#     """
#     Update a order.
#     """
#     res = order_handler.update_order(
#         order_id=id, update_data=update_data, is_admin=True
#     )
#     # Invalidate cache
#     cache.delete(f"order:{id}")
#     cache.invalidate("orders")
#     return res


@router.post("/export")
async def export_orders(
    current_user: CurrentUser, bucket: Storage
):
    try:
        orders = await db.order.find_many()
        file_url = await export(
            data=orders, name="Order", bucket=bucket, email=current_user.email
        )

        return {"message": "Data Export successful", "file_url": file_url}
    except Exception as e:
        logger.error(f"Export orders error: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e
