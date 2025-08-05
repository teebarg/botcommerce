from fastapi import APIRouter, Depends, Header, HTTPException, Query, BackgroundTasks, Request
from app.core.deps import (
    CurrentUser,
    Notification,
    get_current_superuser,
    RedisClient,
)
from typing import Optional
from app.prisma_client import prisma as db
from app.models.order import OrderResponse, OrderUpdate, OrderCreate, Orders
from prisma.enums import OrderStatus
from app.services.order import create_order_from_cart, send_notification, retrieve_order, list_orders
from app.services.redis import cache_response
from pydantic import BaseModel

router = APIRouter()

@router.post("/", response_model=OrderResponse)
async def create_order(
    cache: RedisClient,
    background_tasks: BackgroundTasks,
    order_in: OrderCreate,
    user: CurrentUser,
    notification: Notification,
    cartId: str = Header(default=None),
):
    try:
        order = await create_order_from_cart(order_in, user.id, cartId)
        background_tasks.add_task(send_notification, id=order.id, user_id=user.id, notification=notification)
        await cache.invalidate_list_cache("orders")
        return order
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{order_id}", response_model=OrderResponse)
@cache_response(key_prefix="order", key=lambda request, order_id: order_id)
async def get_order(
    request: Request,
    order_id: str,
):
    return await retrieve_order(order_id)

@router.get("/")
@cache_response(key_prefix="orders")
async def get_orders(
    request: Request,
    user: CurrentUser,
    skip: int = Query(0, ge=0),
    take: int = Query(20, ge=1, le=100),
    status: Optional[OrderStatus] = None,
    sort: Optional[str] = "desc",
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    customer_id: Optional[int] = None,
) -> Orders:
    return await list_orders(
        user_id=user.id,
        skip=skip,
        take=take,
        status=status,
        search=search,
        start_date=start_date,
        end_date=end_date,
        customer_id=customer_id,
        user_role=user.role,
        sort=sort
    )

@router.put("/orders/{order_id}", dependencies=[Depends(get_current_superuser)], response_model=OrderResponse)
async def update_order(cache: RedisClient, order_id: int, order_update: OrderUpdate):
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
    )
    await cache.invalidate_list_cache("orders")
    await cache.bust_tag(f"order:{order_id}")
    return updated_order

@router.delete("/{order_id}")
async def delete_order(cache: RedisClient, order_id: int):
    order = await db.order.find_unique(where={"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    await db.order.delete(where={"id": order_id})
    await cache.invalidate_list_cache("orders")
    await cache.bust_tag(f"order:{order_id}")
    return {"message": "Order deleted successfully"}


@router.patch("/{id}/status", response_model=OrderResponse)
async def order_status(cache: RedisClient, id: int, status: OrderStatus):
    """Change order status"""
    order = await db.order.find_unique(where={"id": id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    data = {"status": status}

    updated_order = await db.order.update(where={"id": id}, data=data)
    await cache.invalidate_list_cache("orders")
    await cache.bust_tag(f"order:{id}")
    return updated_order

@router.post("/{order_id}/fulfill", response_model=OrderResponse)
async def fulfill_order(cache: RedisClient, order_id: int):
    """Mark an order as fulfilled"""
    order = await db.order.find_unique(where={"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status != OrderStatus.PROCESSING:
        raise HTTPException(status_code=400, detail="Order must be in processing status")

    updated_order = await db.order.update(
        where={"id": order_id},
        data={"status": OrderStatus.FULFILLED}
    )
    await cache.invalidate_list_cache("orders")
    await cache.bust_tag(f"order:{order_id}")
    return updated_order

class OrderNotesUpdate(BaseModel):
    notes: str

@router.patch("/{order_id}/notes", response_model=OrderResponse)
async def update_order_notes(cache: RedisClient, order_id: int, notes_update: OrderNotesUpdate, user: CurrentUser = None):
    order = await db.order.find_unique(where={"id": order_id})
    if not order or order.user_id != user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    updated_order = await db.order.update(
        where={"id": order_id},
        data={"order_notes": notes_update.notes}
    )
    await cache.invalidate_list_cache("orders")
    await cache.bust_tag(f"order:{order.order_number}")
    return updated_order