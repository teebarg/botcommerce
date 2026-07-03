from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, BackgroundTasks, Cookie, Response
from prisma.enums import OrderStatus
from app.prisma_client import prisma as db
from app.models.order import Order, OrderCreate, OrderTimelineEntry, PaginatedOrders, OrderNotesUpdate, ReturnItemPayload
from app.core.logging import get_logger
from app.models.generic import Message
from app.core.permissions import require_admin
from app.core.config import settings
from app.core.deps import CurrentUser, PrincipalDep
from app.core.dependencies.order import OrderDep
from app.services.cache import cacheable

logger = get_logger(__name__)

router = APIRouter()

def orders_cache_key(user, request: Request):
    if user.role == "ADMIN":
        scope = "admin"
    else:
        scope: str = f"user:{user.id}"

    return f"{scope}:{request.url.query}"

@router.post("/")
async def create_order(
    response: Response,
    srv: OrderDep,
    order_in: OrderCreate,
    user: CurrentUser,
    _cart_id: Annotated[str | None, Cookie()] = None
) -> Order:
    if _cart_id is None:
        raise HTTPException(status_code=400, detail="Please provide cart number")
    try:
        order = await srv.create_order_from_cart(order_in=order_in, user_id=user.id, cart_number=_cart_id)
        response.delete_cookie(
            key="_cart_id", path="/", httponly=True, samesite="none", secure=True, domain=settings.COOKIE_DOMAIN,
        )
        return order
    except Exception as e:
        logger.error(f"Failed to create order in create_order: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{order_id}")
@cacheable(key_prefix="order", key_builder=lambda order_id, principal: (
    f"{order_id}:admin" if principal.role == "ADMIN" else f"{order_id}:user:{principal.user_id}"
), tags=lambda order_id:["order", f"order:{order_id}"])
async def get_order(
    request: Request,
    srv: OrderDep,
    order_id: str,
    principal: PrincipalDep,
) -> Order:
    order = await srv.get_by_number(order_number=order_id, include_relations=True)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if principal.role == "ADMIN" or principal.type == "service":
        return Order.validate(order)

    if order.user_id != principal.user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return Order.validate(order)


@router.get("/")
@cacheable(key_prefix="orders", key_builder=orders_cache_key, tags=["orders"])
async def get_orders(
    request: Request,
    srv: OrderDep,
    user: CurrentUser,
    cursor: int | None = None,
    take: int = Query(default=20, le=100),
    status: Optional[OrderStatus] = None,
    sort: Optional[str] = "desc",
    order_number: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    customer_id: Optional[int] = None,
) -> PaginatedOrders:
    orders =  await srv.list_paginated(
        user_id=user.id,
        cursor=cursor,
        limit=take,
        status=status,
        order_number=order_number,
        start_date=start_date,
        end_date=end_date,
        customer_id=customer_id,
        user_role=user.role,
        sort=sort or "desc"
    )
    return PaginatedOrders.validate(orders)


@router.delete("/{order_id}", dependencies=[Depends(require_admin)])
async def delete_order(srv: OrderDep, order_id: int):
    order = await srv.get_by_id(order_id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    await db.order.delete(where={"id": order_id})
    await srv.cache_srv.invalidate(tags=["orders", f"order:{order.order_number}"])
    return {"message": "Order deleted successfully"}


@router.patch("/{id}/status", dependencies=[Depends(require_admin)])
async def order_status(srv: OrderDep, id: int, status: OrderStatus) -> Order:
    order = await srv.get_by_id(order_id=id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status == status:
        raise HTTPException(status_code=400, detail="Order status is already the same")

    async with db.tx() as tx:
        try:
            updated_order = await tx.order.update(where={"id": id}, data={"status": status})
            await tx.ordertimeline.create(
                data={"order": {"connect": {"id": id}}, "from_status": order.status, "to_status": status}
            )
        except Exception as e:
            logger.error(f"Failed to create order timeline: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

        await srv.cache_srv.invalidate(f"order-timeline:{id}", tags=["orders", f"order:{order.order_number}"])
        return updated_order


@router.patch("/{order_id}/notes")
async def update_order_notes(
    srv: OrderDep,
    order_id: int,
    notes_update: OrderNotesUpdate,
    user: CurrentUser
) -> Order:
    order = await srv.get_by_id(order_id=order_id)
    if not order or order.user_id != user.id:
        raise HTTPException(status_code=404, detail="Order not found")

    updated_order = await db.order.update(where={"id": order_id}, data={"order_notes": notes_update.notes})
    await srv.cache_srv.invalidate(tags=["orders", f"order:{order.order_number}"])
    return updated_order


@router.get("/{order_id}/timeline", dependencies=[Depends(require_admin)], response_model=list[OrderTimelineEntry])
async def get_order_timeline(srv: OrderDep, order_id: int):
    order = await srv.get_by_id(order_id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return await db.ordertimeline.find_many(where={"order_id": order_id}, order={"created_at": "asc"})


@router.post("/{order_id}/return", dependencies=[Depends(require_admin)], response_model=Message)
async def return_item(
    srv: OrderDep,
    order_id: int,
    payload: ReturnItemPayload,
    background_tasks: BackgroundTasks,
):
    try:
        await srv.return_order_item(order_id=order_id, item_id=payload.item_id, background_tasks=background_tasks)
        return Message(message="Item returned successfully")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to return order item: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
