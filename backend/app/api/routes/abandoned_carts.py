from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.dependencies.cache import ArqDep
from app.core.dependencies.cart import CartDep
from app.core.permissions import require_admin
from app.schemas.cart import CartListResponse, CartResponse
from app.services.cache import cacheable

router = APIRouter()


@router.get("/")
async def list_abandoned_carts(
    srv: CartDep,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
):
    items, total = await srv.get_abandoned_paginated(
        skip=skip, limit=limit, search=search
    )
    return CartListResponse(
        items=[await srv._with_computed_totals(c) for c in items],
        total=total,
        skip=skip,
        limit=limit,
        has_more=skip + len(items) < total,
    )


@router.get("/{id}", response_model=CartResponse)
async def get_abandoned_cart(id: int, srv: CartDep):
    cart = await srv.get_by_id(id)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")
    return await srv._with_computed_totals(cart)


@router.delete("/{id}", status_code=204)
async def delete_abandoned_cart(id: int, srv: CartDep):
    existing = await srv.get_by_id(id)
    if not existing:
        raise HTTPException(status_code=404, detail="Cart not found")
    await srv.delete(id)


@router.post("/send-reminders", dependencies=[Depends(require_admin)])
async def send_reminders(queue: ArqDep, srv: CartDep):
    """Queues background reminders for abandoned carts."""
    items = await srv.get_abandoned()
    cart_ids = [cart.id for cart in items]
    await queue.enqueue_job("process_abandoned_carts", cart_ids=cart_ids)

    return {"message": "reminders queued", "carts_processed": len(items)}


@router.post("/{cart_id}/send-reminder", dependencies=[Depends(require_admin)])
async def send_single_reminder(
    cart_id: int,
    queue: ArqDep,
):
    """Manually triggers a reminder for a specific cart session."""
    await queue.enqueue_job("process_abandoned_carts", cart_ids=[cart_id])
    return {
        "message": f"reminder queued for cart {cart_id}",
        "cart_id": cart_id,
    }
