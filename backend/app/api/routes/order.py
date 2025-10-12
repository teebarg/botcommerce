from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, BackgroundTasks
from app.core.deps import CurrentUser, get_current_superuser
from typing import Optional
from app.prisma_client import prisma as db
from app.models.order import OrderResponse, OrderCreate, Orders
from prisma.enums import OrderStatus
from app.services.order import create_order_from_cart, retrieve_order, list_orders, return_order_item
from app.services.redis import cache_response, invalidate_key, invalidate_pattern
from pydantic import BaseModel
from app.models.order import OrderTimelineEntry
from app.core.logging import get_logger
from app.models.generic import Message

logger = get_logger(__name__)

router = APIRouter()

@router.post("/", response_model=OrderResponse)
async def create_order(
    order_in: OrderCreate,
    user: CurrentUser,
    cartId: str = Header(default=None),
):
    try:
        order = await create_order_from_cart(order_in=order_in, user_id=user.id, cart_number=cartId)
        await invalidate_pattern("orders")
        await invalidate_pattern("cart")
        return order
    except Exception as e:
        logger.error(f"Failed to create order: {str(e)}")
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
    skip: int = Query(default=0, ge=0),
    take: int = Query(default=20, ge=1, le=100),
    status: Optional[OrderStatus] = None,
    sort: Optional[str] = "desc",
    order_number: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    customer_id: Optional[int] = None,
) -> Orders:
    return await list_orders(
        user_id=user.id,
        skip=skip,
        take=take,
        status=status,
        order_number=order_number,
        start_date=start_date,
        end_date=end_date,
        customer_id=customer_id,
        user_role=user.role,
        sort=sort
    )

@router.delete("/{order_id}", dependencies=[Depends(get_current_superuser)])
async def delete_order(order_id: int):
    order = await db.order.find_unique(where={"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    await db.order.delete(where={"id": order_id})
    await invalidate_pattern("orders")
    await invalidate_key(f"order:{order_id}")
    return {"message": "Order deleted successfully"}


@router.patch("/{id}/status", dependencies=[Depends(get_current_superuser)], response_model=OrderResponse)
async def order_status(id: int, status: OrderStatus):
    """Change order status"""
    order = await db.order.find_unique(where={"id": id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status == status:
        raise HTTPException(status_code=400, detail="Order status is already the same")

    data = {"status": status}
    async with db.tx() as tx:
        try:
            updated_order = await tx.order.update(where={"id": id}, data=data)
            await tx.ordertimeline.create(
                data={
                    "order": {"connect": {"id": id}},
                    "from_status": order.status,
                    "to_status": status,
                }
            )
        except Exception as e:
            logger.error(f"Failed to create order timeline: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        await invalidate_pattern("orders")
        await invalidate_key(f"order:{id}")
        await invalidate_key(f"order-timeline:{id}")
        return updated_order

class OrderNotesUpdate(BaseModel):
    notes: str

@router.patch("/{order_id}/notes", response_model=OrderResponse)
async def update_order_notes(order_id: int, notes_update: OrderNotesUpdate, user: CurrentUser = None):
    order = await db.order.find_unique(where={"id": order_id})
    if not order or order.user_id != user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    updated_order = await db.order.update(
        where={"id": order_id},
        data={"order_notes": notes_update.notes}
    )
    await invalidate_pattern("orders")
    await invalidate_key(f"order:{order.order_number}")
    return updated_order


@router.get("/{order_id}/timeline", dependencies=[Depends(get_current_superuser)], response_model=list[OrderTimelineEntry])
async def get_order_timeline(order_id: int):
    order = await db.order.find_unique(where={"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    entries = await db.ordertimeline.find_many(
        where={"order_id": order_id}, order={"created_at": "asc"}
    )
    return entries


class ReturnItemPayload(BaseModel):
    item_id: int


@router.post("/{order_id}/return", dependencies=[Depends(get_current_superuser)], response_model=Message)
async def return_item(order_id: int, payload: ReturnItemPayload, background_tasks: BackgroundTasks):
    """Return an item from an order, update totals and inventory."""
    try:
        await return_order_item(order_id=order_id, item_id=payload.item_id, background_tasks=background_tasks)
        return {"message": "Item returned successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to return order item: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
