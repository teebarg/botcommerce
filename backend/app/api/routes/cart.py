from typing import Optional, Annotated
from datetime import datetime, timedelta, timezone
from app.core.utils import generate_id
from app.models.cart import CartUpdate, CartItemCreate, CartItem, Cart, CartLite, SendAbandonedCartReminders, PaginatedAbandonedCarts
from app.core.notifications.events import SendAbandonedCartEvent
from fastapi import APIRouter, HTTPException, Request, BackgroundTasks, Depends, Cookie, Response
from app.prisma_client import prisma as db
from app.core.deps import Notification, UserDep, CurrentUser
from app.services.redis import cache_response, refresh_data
from app.core.logging import get_logger
from app.services.shop_settings import ShopSettingsService
from prisma.enums import CartStatus
from app.models.generic import Message
from app.core.permissions import require_admin
from fastapi.responses import JSONResponse
from app.core.config import settings

logger = get_logger(__name__)

router = APIRouter()

MAX_AGE_SECONDS = 365 * 24 * 60 * 60  # 1 year

def _set_cart_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="_cart_id",
        value=token,
        max_age=MAX_AGE_SECONDS,
        path="/",
        httponly=True,
        secure=True,
        samesite="none",
        domain=settings.COOKIE_DOMAIN,
    )

async def _handle_add_item(item_in: CartItemCreate, cart: Cart) -> CartItem:
    variant = await db.productvariant.find_unique(
        where={"id": item_in.variant_id},
        include={"product": {"include": {"images": True}}}
    )

    if not variant:
        raise HTTPException(status_code=400, detail="product does not exist")
    if variant.status != "IN_STOCK":
        raise HTTPException(status_code=400, detail="product is out of stock")

    if item_in.quantity > variant.inventory:
        available_quantity = variant.inventory - item_in.quantity
        if available_quantity <= 0:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough inventory. Only {variant.inventory} items available in stock."
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Not enough inventory. You can add {available_quantity} more items (only {variant.inventory} available in stock)."
            )

    item = await db.cartitem.create(
        data={
            "cart_id": cart.id,
            "cart_number": cart.cart_number,
            "name": variant.product.name,
            "slug": variant.product.slug,
            "variant_id": item_in.variant_id,
            "quantity": item_in.quantity,
            "price": variant.price,
            "image": variant.product.images[0].image if variant.product.images else variant.product.image
        },
        include={"variant": True}
    )
    return item

async def calculate_cart_totals(cart: Cart):
    """Helper function to calculate cart totals"""
    from app.services.coupon import CouponService
    service = ShopSettingsService()

    tax_rate = float(await service.get("tax_rate"))
    cart_items = await db.cartitem.find_many(where={"cart_id": cart.id})

    subtotal = sum(item.price * item.quantity for item in cart_items)

    discount_amount = 0.0
    if cart.coupon_id:
        coupon_service = CouponService()
        coupon = await db.coupon.find_unique(where={"id": cart.coupon_id})
        if coupon:
            try:
                await coupon_service.validate_coupon(
                    code=coupon.code,
                    cart=cart,
                    user_id=cart.user_id
                )
                discount_amount = await coupon_service.calculate_discount(coupon, subtotal)
            except Exception:
                discount_amount = 0.0
                await db.cart.update(
                    where={"id": cart.id},
                    data={"coupon_id": None}
                )

    wallet_used = 0
    if cart.wallet_used > 0:
        wallet_used: float = cart.wallet_used

    new_subtotal: float = max(subtotal - discount_amount, 0)
    tax: float = new_subtotal * (tax_rate / 100)
    shipping_fee = cart.shipping_fee or 0
    total: float = new_subtotal + tax + shipping_fee

    total_after_wallet: float = max(total - wallet_used, 0)

    data={
        "subtotal": subtotal,
        "tax": tax,
        "discount_amount": discount_amount,
        "total": total_after_wallet,
    }

    if total <= 0:
        data["payment_method"] = "WALLET"

    await db.cart.update(where={"id": cart.id}, data=data)
    await refresh_data(patterns=["abandoned-carts"])


async def get_cart(cart_number: Optional[str], user_id: Optional[int]):
    """Retrieve an existing cart"""
    if user_id:
        cart = await db.cart.find_first(
            where={"user_id": user_id, "status": CartStatus.ACTIVE},
            order={"created_at": "desc"}
        )
        if cart:
            return cart

    if cart_number:
        cart = await db.cart.find_unique(where={"cart_number": cart_number, "status": CartStatus.ACTIVE})
        if cart:
            return cart

    return None

async def create_cart(user_id: Optional[str]):
    """Create a new cart"""
    new_cart_id = generate_id()
    return await db.cart.create(data={"cart_number": new_cart_id, "user_id": user_id})


@router.post("/items", response_model=CartItem)
async def add_item_to_cart(
    response: Response,
    item_in: CartItemCreate,
    user: UserDep,
    background_tasks: BackgroundTasks,
    _cart_id: Annotated[str | None, Cookie()] = None
):
    cart = await get_cart(cart_number=_cart_id, user_id=user.id if user else None)
    if cart is None:
        cart = await create_cart(user_id=user.id if user else None)

    item = await _handle_add_item(item_in, cart)

    background_tasks.add_task(calculate_cart_totals, cart=cart)
    _set_cart_cookie(response, cart.cart_number)

    return item


@router.get("/")
async def get_cart_index(request: Request, response: Response, user: UserDep, _cart_id: Annotated[str | None, Cookie()] = None) -> Optional[Cart]:
    """Get a specific cart by ID"""
    include_query = {
        "items": {"include": {"variant": True}},
        "shipping_address": True
    }

    if user:
        cart = await db.cart.find_first(
            where={"user_id": user.id, "status": CartStatus.ACTIVE},
            order={"updated_at": "desc"},
            include=include_query
        )
        if cart:
            _set_cart_cookie(response, cart.cart_number)
            return cart

    if _cart_id:
        cart = await db.cart.find_unique(where={"cart_number": _cart_id}, include=include_query)
        if cart:
            return cart

    new_cart_id = generate_id()
    _set_cart_cookie(response, new_cart_id)
    return await db.cart.create(
        data={"cart_number": new_cart_id, "user_id": user.id if user else None},
        include=include_query
    )


@router.get("/items", response_model=Optional[list[CartItem]])
async def get_cart_items(response: Response, user: UserDep, _cart_id: Annotated[str | None, Cookie()] = None):
    """Get all items in a specific cart"""
    cart = await get_cart(cart_number=_cart_id, user_id=user.id if user else None)
    if cart is None:
        cart = await create_cart(user_id=user.id if user else None)
        _set_cart_cookie(response, cart.cart_number)
        return []
    return await db.cartitem.find_many(where={"cart_number": cart.cart_number}, include={"variant": True})


@router.put("/")
async def update_cart(response: Response,cart_update: CartUpdate, user: UserDep, _cart_id: Annotated[str | None, Cookie()] = None) -> CartLite:
    """Update cart status"""
    cart = await get_cart(cart_number=_cart_id, user_id=user.id if user else None)
    if cart is None:
        cart = await create_cart(user_id=user.id if user else None)
        _set_cart_cookie(response, cart.cart_number)

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
                        "user": {"connect": {"id": user.id}} if user else None
                    }
                )

            update_data["shipping_address"] = {"connect": {"id": address.id}}
            update_data["billing_address"] = {"connect": {"id": address.id}}
            await refresh_data(keys=[f"addresses:{user.id}", f"address:{address.id}"])

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
            update_data["total"] = cart.subtotal + cart.tax + update_data["shipping_fee"] - cart.discount_amount - cart.wallet_used

        if user:
            update_data["user"] = {"connect": {"id": user.id}}

        updated_cart = await tx.cart.update(
            where={"cart_number": cart.cart_number},
            data=update_data,
        )

        keys: list[str] = [f"cart:{cart.cart_number}"]
        if cart.user_id:
            keys.append(f"cart:{cart.user_id}")
        await refresh_data(patterns=["abandoned-carts"], keys=keys)
        return updated_cart


@router.delete("/items/{item_id}")
async def delete_cart_item(response: Response, item_id: int, user: UserDep, _cart_id: Annotated[str | None, Cookie()] = None):
    cart = await get_cart(cart_number=_cart_id, user_id=user.id if user else None)
    if cart is None:
        cart = await create_cart(user_id=user.id if user else None)
        _set_cart_cookie(response, cart.cart_number)
        return {"message": "Item removed from cart successfully"}

    cart_item = await db.cartitem.find_unique(where={"id": item_id})
    if not cart_item or cart_item.cart_number != cart.cart_number:
        raise HTTPException(status_code=404, detail="cart item not found")

    decrement = cart_item.price * cart_item.quantity
    subtotal = cart.subtotal - decrement
    service = ShopSettingsService()
    tax = subtotal * (float(await service.get("tax_rate")) / 100)
    total = subtotal + tax + cart.shipping_fee - cart.discount_amount - cart.wallet_used

    async with db.tx() as tx:
        await tx.cartitem.delete(where={"id": item_id})
        await tx.cart.update(
            where={"cart_number": cart.cart_number},
            data={"subtotal": subtotal, "tax": tax, "total": total},
        )

    keys: list[str] = [f"cart:{cart.cart_number}"]
    if cart.user_id:
        keys.append(f"cart:{cart.user_id}")
    await refresh_data(patterns=["abandoned-carts"], keys=keys)
    return {"message": "Item removed from cart successfully"}


@router.put("/items/{item_id}", response_model=CartItem)
async def update_cart_item(response: Response, item_id: int, quantity: int, user: UserDep, background_tasks: BackgroundTasks, _cart_id: Annotated[str | None, Cookie()] = None):
    cart = await get_cart(cart_number=_cart_id, user_id=user.id if user else None)
    if cart is None:
        cart = await create_cart(user_id=user.id if user else None)
        item_in = CartItemCreate(variant_id=item_id, quantity=quantity)
        await _handle_add_item(item_in, cart)
        background_tasks.add_task(calculate_cart_totals, cart=cart)
        _set_cart_cookie(response, cart.cart_number)
        return {"message": "Item removed from cart successfully"}

    cart_item = await db.cartitem.find_unique(
        where={"id": item_id},
        include={"variant": True}
    )
    if not cart_item or cart_item.cart_number != cart.cart_number:
        raise HTTPException(status_code=404, detail="cart item not found")

    if quantity > cart_item.variant.inventory:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough inventory. Only {cart_item.variant.inventory} items available in stock."
        )

    updated_item = await db.cartitem.update(
        where={"id": item_id},
        data={"quantity": quantity},
        include={"variant": True}
    )

    background_tasks.add_task(calculate_cart_totals, cart=cart)

    return updated_item


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


@router.post("/abandoned-carts/send-reminders")
async def send_abandoned_cart_reminders(
    background_tasks: BackgroundTasks,
    notification: Notification,
    data: SendAbandonedCartReminders
):
    """
    Send reminder emails to users with abandoned carts.

    Args:
        hours_threshold: Hours after which a cart is considered abandoned (default: 24)
        limit: Maximum number of carts to process (default: 50)
    """
    try:
        threshold_time = datetime.now(timezone.utc) - timedelta(hours=data.hours_threshold)
        abandoned_carts = await db.cart.find_many(
            where={
                "status": {"in": [CartStatus.ACTIVE, CartStatus.ABANDONED]},
                "updated_at": {"gt": threshold_time},
                "user_id": {"not": None},
            },
            take=data.limit,
            order={"updated_at": "asc"}
        )

        if not abandoned_carts:
            return {
                "message": "No abandoned carts found",
                "carts_processed": 0,
                "threshold_hours": data.hours_threshold
            }

        for cart in abandoned_carts:
            background_tasks.add_task(send_abandoned_cart_reminder, cart_id=cart.id, notification=notification)

        logger.debug(f"Queued {len(abandoned_carts)} abandoned cart reminders")

        return {
            "message": f"Abandoned cart reminders queued successfully",
            "carts_processed": len(abandoned_carts),
            "threshold_hours": data.hours_threshold,
        }

    except Exception as e:
        logger.error(f"Failed to process abandoned cart reminders: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process abandoned cart reminders: {str(e)}"
        )


@router.get("/abandoned-carts", dependencies=[Depends(require_admin)])
@cache_response(key_prefix="abandoned-carts")
async def get_admin_abandoned_carts(
    request: Request,
    search: Optional[str] = None,
    hours_threshold: int = 24,
    cursor: int | None = None,
    limit: int = 20
) -> PaginatedAbandonedCarts:
    """
    Get abandoned carts for admin dashboard with filtering and pagination.
    """
    try:
        where_clause = {"status": {"in": [CartStatus.ACTIVE, CartStatus.ABANDONED]}}
        threshold_time = datetime.now(timezone.utc) - timedelta(hours=hours_threshold)
        where_clause["updated_at"] = {"gt": threshold_time}

        if search:
            search_clause = {
                "OR": [
                    {"email": {"contains": search, "mode": "insensitive"}},
                    {"user": {"first_name": {"contains": search, "mode": "insensitive"}}},
                    {"user": {"last_name": {"contains": search, "mode": "insensitive"}}},
                    {"user": {"email": {"contains": search, "mode": "insensitive"}}}
                ]
            }
            where_clause.update(search_clause)

        where_clause["items"] = {"some": {}}

        carts = await db.cart.find_many(
            where=where_clause,
            skip=1 if cursor else 0,
            take=limit + 1,
            cursor={"id": cursor} if cursor else None,
            order={"updated_at": "desc"},
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
                },
            }
        )

        items = carts[:limit]

        return {
            "items": items,
            "next_cursor": items[-1].id if len(carts) > limit else None,
            "limit": limit
        }

    except Exception as e:
        logger.error(f"Failed to get admin abandoned carts: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get admin abandoned carts: {str(e)}"
        )


@router.post("/abandoned-carts/{cart_id}/send-reminder", dependencies=[Depends(require_admin)])
async def send_cart_reminder(
    cart_id: int,
    background_tasks: BackgroundTasks,
    notification: Notification,
):
    """
    Send a recovery email reminder for a specific abandoned cart.
    """
    try:
        cart = await db.cart.find_unique(
            where={"id": cart_id, "user_id": {"not": None}},
        )

        if not cart:
            raise HTTPException(status_code=404, detail="cart not found")

        background_tasks.add_task(send_abandoned_cart_reminder, cart_id=cart.id, notification=notification)

        return {
            "message": "Recovery email queued successfully",
            "cart_id": cart_id,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to send cart reminder for cart {cart_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send cart reminder: {str(e)}"
        )


@router.get("/abandoned-carts/stats", dependencies=[Depends(require_admin)])
@cache_response(key_prefix="abandoned-carts:stats")
async def get_abandoned_carts_stats(request: Request, hours_threshold: int = 24):
    """
    Get statistics for abandoned carts dashboard.
    """
    threshold_time = datetime.now(timezone.utc) - timedelta(hours=hours_threshold)
    try:
        active_count = await db.cart.count(
            where={
                "status": CartStatus.ACTIVE,
                "items": {"some": {}},
                "updated_at": {"gt": threshold_time}
            }
        )

        abandoned_count = await db.cart.count(
            where={
                "status": CartStatus.ABANDONED,
                "items": {"some": {}},
                "updated_at": {"gt": threshold_time}
            }
        )

        converted_count = await db.cart.count(
            where={
                "status": CartStatus.CONVERTED,
                "items": {"some": {}},
                "updated_at": {"gt": threshold_time}
            }
        )

        non_converted_carts = await db.cart.find_many(
            where={
                "status": {"in": [CartStatus.ACTIVE, CartStatus.ABANDONED]},
                "items": {"some": {}},
                "updated_at": {"gt": threshold_time}
            },
        )

        potential_revenue = sum(cart.total for cart in non_converted_carts if cart.total)

        return {
            "active_count": active_count,
            "abandoned_count": abandoned_count,
            "converted_count": converted_count,
            "potential_revenue": potential_revenue,
        }

    except Exception as e:
        logger.error(f"Failed to get abandoned carts stats: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get abandoned carts stats: {str(e)}"
        )

@router.post("/apply-wallet")
async def apply_wallet(user: CurrentUser, _cart_id: Annotated[str | None, Cookie()] = None) -> Message:
    """
    Apply wallet balance to a cart.
    """
    cart = await get_cart(cart_number=_cart_id, user_id=user.id)
    if not cart:
        cart = await create_cart(user_id=user.id if user else None)
        response = JSONResponse(
            status_code=400,
            content={"detail": "Your cart is empty, add some items first"}
        )
        _set_cart_cookie(response, cart.cart_number)
        return response

    if not user.wallet_balance or user.wallet_balance <= 0:
        raise HTTPException(status_code=400, detail="Wallet balance is empty")

    subtotal = cart.subtotal or 0
    tax = cart.tax or 0
    shipping = cart.shipping_fee or 0
    discount = cart.discount_amount or 0

    total = subtotal + tax + shipping - discount
    wallet_to_use: float = min(user.wallet_balance, total)
    total -= wallet_to_use

    data: dict[str, float] = {
        "wallet_used": wallet_to_use,
        "total": max(total, 0),
    }

    if total <= 0:
        data["payment_method"] = "WALLET"

    try:
        async with db.tx() as tx:
            await tx.cart.update(where={"id": cart.id}, data=data)
            await tx.wallettransaction.create(
                data={
                    "user": {"connect": {"id": user.id}},
                    "amount": wallet_to_use,
                    "reference_code": "WALLET_PAYMENT",
                    "type": "WITHDRAWAL",
                    "reference_id": cart.cart_number,
                }
            )
            await tx.user.update(where={"id": user.id}, data={"wallet_balance": {"decrement": wallet_to_use}})
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail="Failed to update cart")

    await refresh_data(patterns=["user"])

    return Message(message="Wallet applied")


@router.post("/remove-wallet")
async def remove_wallet(user: CurrentUser,  _cart_id: Annotated[str | None, Cookie()] = None) -> Message:
    """
    Remove wallet usage from the cart, refund the wallet, and recalculate totals.
    """
    cart = await get_cart(cart_number=_cart_id, user_id=user.id)
    if not cart:
        cart = await create_cart(user_id=user.id if user else None)
        response = JSONResponse(
            status_code=400,
            content={"detail": "Your cart is empty, add some items to your cart"}
        )
        _set_cart_cookie(response, cart.cart_number)
        return response

    wallet_used = cart.wallet_used or 0
    if wallet_used <= 0:
        return Message(message="No Wallet applied")

    try:
        async with db.tx() as tx:
            await tx.user.update(where={"id": user.id}, data={"wallet_balance": {"increment": wallet_used}})
            await tx.wallettransaction.create(
                data={
                    "user": {"connect": {"id": user.id}},
                    "amount": wallet_used,
                    "reference_code": "WALLET_REVERSAL",
                    "type": "REVERSAL",
                    "reference_id": cart.cart_number,
                }
            )
            data = {"wallet_used": 0}
            if cart.payment_method == "WALLET":
                data["payment_method"] = "BANK_TRANSFER"
            await tx.cart.update(where={"id": cart.id}, data=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove wallet: {e}")

    await calculate_cart_totals(cart)
    await refresh_data(patterns=["user"])

    return Message(message="Wallet removed successfully")
