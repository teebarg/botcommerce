from fastapi import APIRouter, Depends, Header, HTTPException, Response, Query

from app.core.deps import (
    CurrentUser,
    Notification,
    get_current_superuser,
    get_current_user,
)
from app.core.logging import logger
from app.core.utils import generate_invoice_email
from app.services.export import export
from typing import Optional
import uuid
from app.prisma_client import prisma as db
from app.models.order import OrderResponse, OrderStatus, OrderUpdate, OrderCreate, Orders
from math import ceil

# Create a router for orders
router = APIRouter()


@router.post("/", response_model=OrderResponse)
async def create_order(notification: Notification, order_in: OrderCreate, user: CurrentUser, cartId: str = Header(default=None)):
    # Generate unique order number
    order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"

    cart = await db.cart.find_unique(where={"cart_number": cartId}, include={"items": True})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    # Create order with items
    new_order = await db.order.create(
        data={
            "order_number": order_number,
            "email": cart.email,
            "total": order_in.total,
            "subtotal": order_in.subtotal,
            "tax": order_in.tax,
            "shipping_fee": cart.shipping_fee,
            "status": order_in.status,
            "payment_status": order_in.payment_status,
            "shipping_method": cart.shipping_method,
            # "coupon_id": order_in.coupon_id,
            "payment_method": cart.payment_method,
            "cart": {"connect": {"id": cart.id}},
            "user": {"connect": {"id": user.id}},
            "billing_address": {"connect": {"id": cart.billing_address_id}},
            "shipping_address": {"connect": {"id": cart.shipping_address_id}},
            "order_items": {
                "create": [
                    {
                        "image": item.image,
                        "variant": {"connect": {"id": item.variant_id}},
                        "quantity": item.quantity,
                        "price": item.price
                    } for item in cart.items
                ]
            }
        },
        include={
            "order_items": {"include": {"variant": True}},
            "user": True,
            "shipping_address": True,
            "billing_address": True
        }
    )

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
                f"*Customer:* {user.first_name} {user.last_name}\n"
                f"*Email:* {user.email}\n"
                f"*Amount:* {new_order.total}\n"
                f"*Payment Status:* {new_order.payment_status}"
    }

    notification.send_notification(
        channel_name="slack",
        slack_message=slack_message
    )
    return new_order


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str):
    """
    Get a specific order by order_number.
    """
    order = await db.order.find_unique(
        where={"order_number": order_id},
        include={
            "order_items": {
                "include": {
                    "variant": True
                }
            },
            "user": True,
            "shipping_address": True,
            "billing_address": True
        }
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.get("/")
async def get_orders(
    user: CurrentUser,
    skip: int = Query(0, ge=0),
    take: int = Query(20, ge=1, le=100),
    status: Optional[OrderStatus] = None,
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    customer_id: Optional[int] = None,
) -> Orders:
    """List orders with filtering and pagination"""
    where = {}
    if status:
        where["status"] = status
    if customer_id:
        where["user_id"] = customer_id
    if search:
        where["order_number"] = search
    if user.role == "CUSTOMER":
        where["user_id"] = user.id
    if start_date:
        where["created_at"] = {"gte": start_date}
    if end_date:
        where["created_at"] = {"lte": end_date}

    orders = await db.order.find_many(
        where=where,
        skip=skip,
        take=take,
        order={"created_at": "desc"},
        include={"order_items": True, "user": True, "shipping_address": True, "billing_address": True}
    )
    total = await db.order.count(where=where)
    return {
        "orders":orders,
        "page":skip,
        "limit":take,
        "total_pages":ceil(total/take),
        "total_count":total,
    }


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


@router.post("/export")
async def export_orders(current_user: CurrentUser):
    try:
        orders = await db.order.find_many()
        file_url = await export(
            data=orders, name="Order", email=current_user.email
        )

        return {"message": "Data Export successful", "file_url": file_url}
    except Exception as e:
        logger.error(f"Export orders error: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(order_id: int):
    """Cancel an order"""
    order = await db.order.find_unique(where={"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status not in [OrderStatus.PENDING, OrderStatus.PROCESSING]:
        raise HTTPException(status_code=400, detail="Order cannot be cancelled")

    updated_order = await db.order.update(
        where={"id": order_id},
        data={"status": OrderStatus.CANCELLED},
        include={"order_items": True}
    )
    return updated_order

@router.post("/{order_id}/fulfill", response_model=OrderResponse)
async def fulfill_order(order_id: int):
    """Mark an order as fulfilled"""
    order = await db.order.find_unique(where={"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status != OrderStatus.PROCESSING:
        raise HTTPException(status_code=400, detail="Order must be in processing status")

    updated_order = await db.order.update(
        where={"id": order_id},
        data={"status": OrderStatus.FULFILLED},
        # include={"order_items": True}
    )
    return updated_order

@router.post("/{order_id}/refund", response_model=OrderResponse)
async def refund_order(order_id: int):
    """Refund an order"""
    order = await db.order.find_unique(where={"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status != OrderStatus.FULFILLED:
        raise HTTPException(status_code=400, detail="Order must be fulfilled to be refunded")

    updated_order = await db.order.update(
        where={"id": order_id},
        data={"status": OrderStatus.REFUNDED},
        # include={"order_items": True}
    )
    return updated_order
