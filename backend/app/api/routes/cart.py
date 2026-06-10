from typing import Any, Dict, Optional, Annotated
from datetime import datetime, timedelta, timezone
from app.core.dependencies.cart import get_cart_repository, get_cart_service
from fastapi import APIRouter, HTTPException, Request, BackgroundTasks, Depends, Cookie, Response
from fastapi.responses import JSONResponse

from app.prisma_client import prisma as db
from app.core.deps import Notification, UserDep, CurrentUser
from app.services.redis import cache_response, refresh_data
from app.core.logging import get_logger
from app.core.permissions import require_admin
from app.core.config import settings
from prisma.enums import CartStatus

from app.models.generic import Message
from app.models.cart import (
    CartUpdate, CartItemCreate, CartItem, Cart, CartLite,
    SendAbandonedCartReminders, PaginatedAbandonedCarts
)
from app.core.notifications.events import SendAbandonedCartEvent
from app.services.cart import CartRepository, CartService

logger = get_logger(__name__)

router = APIRouter()

MAX_AGE_SECONDS = 365 * 24 * 60 * 60  # 1 year

def _set_cart_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="_cart_id", value=token, max_age=MAX_AGE_SECONDS, path="/",
        httponly=True, secure=True, samesite="none", domain=settings.COOKIE_DOMAIN,
    )

@router.post("/items", response_model=CartItem)
async def add_item_to_cart(
    response: Response,
    item_in: CartItemCreate,
    user: UserDep,
    background_tasks: BackgroundTasks,
    repo: CartRepository = Depends(get_cart_repository),
    service: CartService = Depends(get_cart_service),
    _cart_id: Annotated[str | None, Cookie()] = None
):
    cart = await repo.get_active_cart(cart_number=_cart_id, user_id=user.id if user else None)
    if not cart:
        cart = await repo.create_empty_cart(user_id=user.id if user else None)

    item = await service.add_item(cart=cart, variant_id=item_in.variant_id, quantity=item_in.quantity)
    background_tasks.add_task(service.calculate_totals, cart_id=cart.id)
    _set_cart_cookie(response, cart.cart_number)
    return item


@router.get("/", response_model=Optional[Cart])
async def get_cart_index(
    response: Response,
    user: UserDep,
    repo: CartRepository = Depends(get_cart_repository),
    _cart_id: Annotated[str | None, Cookie()] = None
):
    cart = await repo.get_active_cart(cart_number=_cart_id, user_id=user.id if user else None, include_relations=True)
    if not cart:
        cart = await repo.create_empty_cart(user_id=user.id if user else None, include_relations=True)

    _set_cart_cookie(response, cart.cart_number)
    return cart


@router.delete("/items/{item_id}")
async def delete_cart_item(
    item_id: int,
    user: UserDep,
    background_tasks: BackgroundTasks,
    repo: CartRepository = Depends(get_cart_repository),
    service: CartService = Depends(get_cart_service),
    _cart_id: Annotated[str | None, Cookie()] = None
):
    cart = await repo.get_active_cart(cart_number=_cart_id, user_id=user.id if user else None)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart session not found")

    cart_item = await db.cartitem.find_unique(where={"id": item_id})
    if not cart_item or cart_item.cart_number != cart.cart_number:
        raise HTTPException(status_code=404, detail="Cart item relation mismatch")

    await db.cartitem.delete(where={"id": item_id})
    background_tasks.add_task(service.calculate_totals, cart_id=cart.id)
    return {"message": "Item removed from cart successfully"}


@router.put("/items/{item_id}", response_model=CartItem)
async def update_cart_item(
    item_id: int,
    quantity: int,
    user: UserDep,
    background_tasks: BackgroundTasks,
    repo: CartRepository = Depends(get_cart_repository),
    service: CartService = Depends(get_cart_service),
    _cart_id: Annotated[str | None, Cookie()] = None
):
    cart = await repo.get_active_cart(cart_number=_cart_id, user_id=user.id if user else None)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart sequence missing")

    cart_item = await db.cartitem.find_unique(where={"id": item_id}, include={"variant": True})
    if not cart_item or cart_item.cart_number != cart.cart_number:
        raise HTTPException(status_code=404, detail="Cart item tracking mismatch")

    if quantity > cart_item.variant.inventory:
        raise HTTPException(status_code=400, detail=f"Not enough inventory. Only {cart_item.variant.inventory} items available.")

    updated_item = await db.cartitem.update(where={"id": item_id}, data={"quantity": quantity}, include={"variant": True})
    background_tasks.add_task(service.calculate_totals, cart_id=cart.id)
    return updated_item


@router.put("/")
async def update_cart(
    cart_update: CartUpdate,
    user: UserDep,
    repo: CartRepository = Depends(get_cart_repository),
    service: CartService = Depends(get_cart_service),
    _cart_id: Annotated[str | None, Cookie()] = None
) -> CartLite:
    cart = await repo.get_active_cart(cart_number=_cart_id, user_id=user.id if user else None)
    if not cart:
        cart = await repo.create_empty_cart(user_id=user.id if user else None)

    async with db.tx() as tx:
        update_data = {}
        if cart_update.shipping_address:
            if cart_update.shipping_address.id:
                address = await tx.address.upsert(
                    where={"id": cart_update.shipping_address.id},
                    data={
                        "create": {
                            **cart_update.shipping_address.model_dump(exclude={"id"}),
                            "user_id": user.id if user else None
                        },
                        "update": {
                            **cart_update.shipping_address.model_dump(exclude={"id", "user_id"}),
                        }
                    }
                )
            else:
                address = await tx.address.create(
                    data={
                        **cart_update.shipping_address.model_dump(exclude={"id"}),
                        "user_id": user.id if user else None
                    }
                )

            update_data["shipping_address"] = {"connect": {"id": address.id}}
            update_data["billing_address"] = {"connect": {"id": address.id}}
            await refresh_data(keys=[f"addresses:{user.id if user else 'guest'}", f"address:{address.id}"])

        if cart_update.status is not None:
            update_data["status"] = cart_update.status
        if cart_update.email is not None:
            update_data["email"] = cart_update.email
        if cart_update.phone is not None:
            update_data["phone"] = cart_update.phone
        if cart_update.payment_method is not None:
            update_data["payment_method"] = cart_update.payment_method
        if cart_update.shipping_method is not None:
            update_data["shipping_method"] = cart_update.shipping_method

        if cart_update.shipping_fee is not None:
            update_data["shipping_fee"] = cart_update.shipping_fee
            # Defensive inline projection before full service sync
            update_data["total"] = max(
                (cart.subtotal or 0) + (cart.tax or 0) + cart_update.shipping_fee - (cart.discount_amount or 0) - (cart.wallet_used or 0),
                0
            )

        if user:
            update_data["user"] = {"connect": {"id": user.id}}

        updated_cart = await tx.cart.update(
            where={"cart_number": cart.cart_number},
            data=update_data
        )

    await service.calculate_totals(cart_id=cart.id)

    keys = [f"cart:{cart.cart_number}"]
    if cart.user_id:
        keys.append(f"cart:{cart.user_id}")
    await refresh_data(patterns=["abandoned-carts"], keys=keys)

    return updated_cart


@router.post("/apply-wallet")
async def apply_wallet(
    user: CurrentUser,
    repo: CartRepository = Depends(get_cart_repository),
    service: CartService = Depends(get_cart_service),
    _cart_id: Annotated[str | None, Cookie()] = None
) -> Message:
    cart = await repo.get_active_cart(cart_number=_cart_id, user_id=user.id)
    if not cart or (await db.cartitem.count(where={"cart_id": cart.id})) == 0:
        return JSONResponse(status_code=400, content={"detail": "Your cart is currently empty"})

    await service.apply_wallet_balance(cart=cart, user=user)
    await service.calculate_totals(cart_id=cart.id)
    await refresh_data(patterns=["user"])
    return Message(message="Wallet balance applied successfully")


@router.post("/remove-wallet")
async def remove_wallet(
    user: CurrentUser,
    repo: CartRepository = Depends(get_cart_repository),
    service: CartService = Depends(get_cart_service),
    _cart_id: Annotated[str | None, Cookie()] = None
) -> Message:
    cart = await repo.get_active_cart(cart_number=_cart_id, user_id=user.id)
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    await service.remove_wallet_balance(cart=cart, user=user)
    await service.calculate_totals(cart_id=cart.id)
    await refresh_data(patterns=["user"])
    return Message(message="Wallet usage removed from cart session")


# =====================================================================
# ABANDONED CART MANAGEMENT
# =====================================================================

@router.get("/abandoned-carts", dependencies=[Depends(require_admin)])
@cache_response(key_prefix="admin:abandoned-carts")
async def get_admin_abandoned_carts(
    request: Request,
    search: Optional[str] = None,
    hours_threshold: int = 24,
    cursor: int | None = None,
    limit: int = 20
) -> PaginatedAbandonedCarts:
    """Retrieves paginated list of abandoned carts for admin dashboard."""
    threshold_time = datetime.now(timezone.utc) - timedelta(hours=hours_threshold)

    where_clause: Dict[str, Any] = {
        "status": {"in": [CartStatus.ACTIVE, CartStatus.ABANDONED]},
        "items": {"some": {}},
        "updated_at": {"gt": threshold_time}
    }

    if search:
        where_clause["OR"] = [
            {"email": {"contains": search, "mode": "insensitive"}},
            {"user": {"is": {"OR": [
                {"first_name": {"contains": search, "mode": "insensitive"}},
                {"last_name": {"contains": search, "mode": "insensitive"}},
                {"email": {"contains": search, "mode": "insensitive"}}
            ]}}}
        ]

    carts = await db.cart.find_many(
        where=where_clause,
        skip=1 if cursor else 0,
        take=limit + 1,
        cursor={"id": cursor} if cursor else None,
        order={"updated_at": "desc"},
        include={"user": True, "items": {"include": {"variant": {"include": {"product": {"include": {"images": True}}}}}}}
    )

    return {
        "items": carts[:limit],
        "next_cursor": carts[-1].id if len(carts) > limit else None,
        "limit": limit
    }


@router.get("/abandoned-carts/stats", dependencies=[Depends(require_admin)])
@cache_response(key_prefix="admin:abandoned-carts:stats")
async def get_abandoned_carts_stats(request: Request, hours_threshold: int = 24):
    """Aggregates recovery metrics and potential revenue."""
    threshold_time = datetime.now(timezone.utc) - timedelta(hours=hours_threshold)

    base_filter = {"items": {"some": {}}, "updated_at": {"gt": threshold_time}}

    active = await db.cart.count(where={**base_filter, "status": CartStatus.ACTIVE})
    abandoned = await db.cart.count(where={**base_filter, "status": CartStatus.ABANDONED})
    converted = await db.cart.count(where={**base_filter, "status": CartStatus.CONVERTED})

    non_converted = await db.cart.find_many(
        where={**base_filter, "status": {"in": [CartStatus.ACTIVE, CartStatus.ABANDONED]}}
    )
    potential_revenue = sum(c.total or 0 for c in non_converted)

    return {
        "active_count": active,
        "abandoned_count": abandoned,
        "converted_count": converted,
        "potential_revenue": potential_revenue
    }


@router.post("/abandoned-carts/send-reminders", dependencies=[Depends(require_admin)])
async def send_batch_reminders(
    data: SendAbandonedCartReminders,
    background_tasks: BackgroundTasks,
    notification: Notification
):
    """Queues background reminders for a batch of abandoned carts."""
    threshold_time = datetime.now(timezone.utc) - timedelta(hours=data.hours_threshold)

    carts = await db.cart.find_many(
        where={
            "status": {"in": [CartStatus.ACTIVE, CartStatus.ABANDONED]},
            "updated_at": {"gt": threshold_time},
            "user_id": {"not": None}
        },
        take=data.limit,
        order={"updated_at": "asc"}
    )

    for cart in carts:
        background_tasks.add_task(send_abandoned_cart_reminder, cart.id, notification)

    return {"message": "Abandoned reminders queued", "carts_processed": len(carts)}


@router.post("/abandoned-carts/{cart_id}/send-reminder", dependencies=[Depends(require_admin)])
async def send_single_reminder(
    cart_id: int,
    background_tasks: BackgroundTasks,
    notification: Notification
):
    """Manually triggers a reminder for a specific cart session."""
    cart = await db.cart.find_unique(where={"id": cart_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    background_tasks.add_task(send_abandoned_cart_reminder, cart.id, notification)
    return {"message": f"Reminder successfully queued for cart {cart.cart_number}", "cart_id": cart_id}


async def send_abandoned_cart_reminder(cart_id: int, notification: Notification):
    """Background task to send abandoned cart reminder email"""
    try:
        cart = await db.cart.find_unique(
            where={"id": cart_id},
            include={
                "user": True,
                "items": {
                    "include": {
                        "variant": {
                            "include": {
                                "product": {
                                    "include": {"images": True}
                                }
                            }
                        }
                    }
                }
            }
        )

        if not cart:
            logger.error(f"cart with ID {cart_id} not found")
            return

        if not cart.user:
            logger.warning(f"cart {cart_id} has no associated user, skipping notification")
            return

        if not cart.email and not cart.user.email:
            logger.warning(f"cart {cart_id} has no email address, skipping notification")
            return

        cart_data = {
            "id": cart.id,
            "cart_number": cart.cart_number,
            "email": cart.email or cart.user.email,
            "total": cart.total,
            "subtotal": cart.subtotal,
            "tax": cart.tax,
            "shipping_fee": cart.shipping_fee,
            "cart_items": [
                {
                    "name": item.name,
                    "quantity": item.quantity,
                    "price": item.price,
                    "image": item.image,
                    "slug": item.slug
                }
                for item in cart.items
            ],
            "updated_at": cart.updated_at
        }

        subscriptions = await db.pushsubscription.find_many(
            where={"userId": cart.user_id}
        )

        await notification.dispatch(SendAbandonedCartEvent(
            cart=cart_data,
            user_email=cart.email or cart.user.email,
            user_name=cart.user.first_name or cart.user.username,
            subscriptions=[subscription.model_dump() for subscription in subscriptions]
        ))

        logger.debug(f"Abandoned cart reminder sent to {cart.email or cart.user.email} for cart {cart.cart_number}")

    except Exception as e:
        logger.error(f"Failed to send abandoned cart reminder for cart {cart_id}: {str(e)}")
