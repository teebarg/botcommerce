from fastapi import APIRouter, Depends, Header, HTTPException, Query, BackgroundTasks, Request

from app.core.deps import (
    CacheService,
    CurrentUser,
    Notification,
    get_current_superuser
)
from app.core.logging import logger
from typing import Optional
from app.prisma_client import prisma as db
from app.models.order import OrderResponse, OrderUpdate, OrderCreate, Orders
from prisma.enums import OrderStatus
from app.services.order import OrderService
from app.core.decorators import cache

# Create a router for orders
router = APIRouter()

def get_order_service(notification: Notification) -> OrderService:
    return OrderService(notification)

@router.post("/", response_model=OrderResponse)
async def create_order(
    background_tasks: BackgroundTasks,
    order_in: OrderCreate,
    user: CurrentUser,
    cartId: str = Header(default=None),
    order_service: OrderService = Depends(get_order_service)
):
    return await order_service.create_order(order_in, user.id, cartId, background_tasks)

@router.get("/{order_id}", response_model=OrderResponse)
@cache(key="order")
async def get_order(
    order_id: str,
    order_service: OrderService = Depends(get_order_service)
):
    return await order_service.get_order(order_id)

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
    order_service: OrderService = Depends(get_order_service)
) -> Orders:
    return await order_service.list_orders(
        user_id=user.id,
        skip=skip,
        take=take,
        status=status,
        search=search,
        start_date=start_date,
        end_date=end_date,
        customer_id=customer_id,
        user_role=user.role
    )

@router.put("/orders/{order_id}", dependencies=[Depends(get_current_superuser)], response_model=OrderResponse)
async def update_order(order_id: int, order_update: OrderUpdate, cache: CacheService):
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
    cache.invalidate("order")
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
