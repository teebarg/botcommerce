from typing import Optional
import uuid
from fastapi import HTTPException
from app.prisma_client import prisma as db
from app.models.order import OrderResponse, OrderCreate
from app.core.utils import generate_invoice_email
from app.core.logging import logger

async def create_order(order_in: OrderCreate, user_id: int, cart_number: str) -> OrderResponse:
    """
    Create a new order from a cart
    """
    order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"

    cart = await db.cart.find_unique(
        where={"cart_number": cart_number},
        include={"items": True}
    )
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    new_order = await db.order.create(
        data={
            "order_number": order_number,
            "email": cart.email,
            "total": cart.total,
            "subtotal": cart.subtotal,
            "tax": cart.tax,
            "shipping_fee": cart.shipping_fee,
            "status": order_in.status,
            "payment_status": order_in.payment_status,
            "shipping_method": cart.shipping_method,
            "payment_method": cart.payment_method,
            "cart": {"connect": {"id": cart.id}},
            "user": {"connect": {"id": user_id}},
            # "billing_address": {"connect": {"id": cart.billing_address_id}},
            "shipping_address": {"connect": {"id": cart.shipping_address_id}},
            "order_items": {
                "create": [
                    {
                        "name": item.name,
                        "image": item.image,
                        "variant": {"connect": {"id": item.variant_id}},
                        "quantity": item.quantity,
                        "price": item.price
                    } for item in cart.items
                ]
            }
        }
    )

    return new_order

async def get_order(order_id: str) -> OrderResponse:
    """
    Get a specific order by order_number
    """
    order = await db.order.find_unique(
        where={"order_number": order_id},
        include={
            "order_items": {
                "include": {
                    "variant": True,
                }
            },
            "user": True,
            "shipping_address": True
        },
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

async def list_orders(
    user_id: int,
    skip: int = 0,
    take: int = 20,
    status: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    customer_id: Optional[int] = None,
    user_role: str = "CUSTOMER",
    sort: Optional[str] = "desc"
):
    """
    List orders with filtering and pagination
    """
    where = {}
    if status:
        where["status"] = status
    if customer_id:
        where["user_id"] = customer_id
    if search:
        where["order_number"] = search
    if user_role == "CUSTOMER":
        where["user_id"] = user_id
    if start_date:
        where["created_at"] = {"gte": start_date}
    if end_date:
        where["created_at"] = {"lte": end_date}

    orders = await db.order.find_many(
        where=where,
        skip=skip,
        take=take,
        order={"created_at": sort},
        include={
            "order_items": {
                "include": {
                    "variant": True,
                }
            },
            "user": True,
            "shipping_address": True,
        }
    )
    total = await db.order.count(where=where)
    return {
        "orders": orders,
        "page": skip,
        "limit": take,
        "total_pages": (total + take - 1) // take,
        "total_count": total,
    }


async def send_notification(id: int, user_id: int, notification):
    try:
        user = await db.user.find_unique(where={"id": user_id})
        if not user:
            logger.error(f"User not found for ID: {user_id}")
            return

        order = await db.order.find_unique(
            where={"id": id},
            include={
                "order_items": {
                    "include": {
                        "variant": True,
                    }
                },
                "user": True,
                "shipping_address": True
            }
        )

        # Send invoice email
        try:
            email_data = await generate_invoice_email(order=order, user=user)
            notification.send_notification(
                channel_name="email",
                recipient=user.email,
                subject=email_data.subject,
                message=email_data.html_content
            )
            logger.info(f"Invoice email sent to user: {user_id}")
        except Exception as e:
            logger.error(f"Failed to generate invoice email: {e}")
            return

        # Send to slack
        slack_message = {
            "text": f"🛍️ *New Order Created* 🛍️\n"
                    f"*Order ID:* {order.order_number}\n"
                    f"*Customer:* {user.first_name} {user.last_name}\n"
                    f"*Email:* {user.email}\n"
                    f"*Amount:* {order.total}\n"
                    f"*Payment Status:* {order.payment_status}"
        }

        notification.send_notification(
            channel_name="slack",
            slack_message=slack_message
        )
        logger.info(f"Slack notification sent to user: {user_id}")
    except Exception as e:
        logger.error(f"Failed to send notification: {e}")
