from typing import Optional
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel

from app.core.utils import generate_id, generate_abandoned_cart_email, send_email
from app.models.cart import CartUpdate, CartItemCreate, CartItemResponse, CartResponse
from fastapi import APIRouter, Header, HTTPException, Request, BackgroundTasks, Depends
from app.prisma_client import prisma as db
from app.core.deps import UserDep, get_current_superuser
from prisma.models import Cart
from app.services.redis import cache_response, invalidate_key, bust, invalidate_pattern
from app.core.logging import get_logger
from app.services.shop_settings import ShopSettingsService
from prisma.enums import CartStatus

logger = get_logger(__name__)

router = APIRouter()

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

    new_subtotal = subtotal - discount_amount
    tax = new_subtotal * (tax_rate / 100)

    total = new_subtotal + tax + cart.shipping_fee

    await db.cart.update(
        where={"id": cart.id},
        data={
            "subtotal": subtotal,
            "tax": tax,
            "discount_amount": discount_amount,
            "total": total
        }
    )

    await invalidate_pattern("abandoned-carts")
    await invalidate_pattern("cart")


async def get_or_create_cart(cart_number: Optional[str], user_id: Optional[str]):
    """Retrieve an existing cart or create a new one if it doesn't exist"""
    if user_id:
        cart = await db.cart.find_first(
            where={"user_id": user_id, "status": CartStatus.ACTIVE},
            order={"created_at": "desc"}
        )
        if cart:
            return cart

    if cart_number:
        cart = await db.cart.find_unique(where={"cart_number": cart_number})
        if cart:
            return cart

    new_cart_id = generate_id()
    return await db.cart.create(data={"cart_number": new_cart_id, "user_id": user_id})


@router.post("/items", response_model=CartItemResponse)
async def add_item_to_cart(
    item_in: CartItemCreate,
    user: UserDep,
    background_tasks: BackgroundTasks,
    cartId: str = Header(default=None)
):
    cart = await get_or_create_cart(cart_number=cartId, user_id=user.id if user else None)

    variant = await db.productvariant.find_unique(
        where={"id": item_in.variant_id},
        include={"product": {"include": {"images": True}}}
    )

    if not variant:
        raise HTTPException(status_code=400, detail="Product does not exist")
    if variant.status != "IN_STOCK":
        raise HTTPException(status_code=400, detail="Product is out of stock")

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

    background_tasks.add_task(calculate_cart_totals, cart=cart)

    return item


@router.get("/", response_model=Optional[CartResponse])
@cache_response(key_prefix="cart", key=lambda request, user, cartId, **kwargs: user.id if user else cartId)
async def get_cart(request: Request, user: UserDep, cartId: str = Header()):
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
            return cart

    if cartId:
        cart = await db.cart.find_unique(where={"cart_number": cartId}, include=include_query)
        if cart:
            return cart

    new_cart_id = generate_id()
    return await db.cart.create(
        data={"cart_number": new_cart_id, "user_id": user.id if user else None},
        include=include_query
    )


@router.get("/items", response_model=Optional[list[CartItemResponse]])
async def get_cart_items(user: UserDep, cartId: str = Header()):
    """Get all items in a specific cart"""
    cart = await get_or_create_cart(cart_number=cartId, user_id=user.id if user else None)
    if not cart:
        return None
    return await db.cartitem.find_many(where={"cart_number": cart.cart_number}, include={"variant": True})


@router.put("/", response_model=CartResponse)
async def update_cart(cart_update: CartUpdate, user: UserDep, cartId: str = Header(default=None)):
    """Update cart status"""
    cart = await get_or_create_cart(cart_number=cartId, user_id=user.id if user else None)
    if not cart:
        cart = await db.cart.create(
            data={
                "cart_number": cartId
            },
        )

    update_data = {}

    if cart_update.shipping_address:
        if cart_update.shipping_address.id:
            address = await db.address.upsert(
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
            address = await db.address.create(
                data={
                    **cart_update.shipping_address.model_dump(exclude={"id"}),
                    "user": {"connect": {"id": user.id}} if user else None
                }
            )

        update_data["shipping_address"] = {"connect": {"id": address.id}}
        update_data["billing_address"] = {"connect": {"id": address.id}}


    if cart_update.status:
        update_data["status"] = cart_update.status

    if cart_update.email:
        update_data["email"] = cart_update.email

    if cart_update.phone:
        update_data["phone"] = cart_update.phone

    if cart_update.payment_method:
        update_data["payment_method"] = cart_update.payment_method

    if cart_update.shipping_method:
        update_data["shipping_method"] = cart_update.shipping_method

    if cart_update.shipping_fee is not None:
        update_data["shipping_fee"] = cart_update.shipping_fee
        update_data["total"] = cart.subtotal + cart.tax + update_data["shipping_fee"] - cart.discount_amount

    if user:
        update_data["user"] = {"connect": {"id": user.id}}

    updated_cart = await db.cart.update(
        where={"cart_number": cart.cart_number},
        data=update_data,
    )

    if cart_update.shipping_address:
        await invalidate_key(f"addresses:{user.id}")

    await bust(f"cart:{cart.cart_number}")
    if cart.user_id:
        await bust(f"cart:{cart.user_id}")
    await invalidate_pattern("abandoned-carts")

    return updated_cart


@router.delete("/items/{item_id}")
async def delete_cart_item(item_id: int, user: UserDep, cartId: str = Header(default=None)):
    cart = await get_or_create_cart(cart_number=cartId, user_id=user.id if user else None)
    cart_item = await db.cartitem.find_unique(where={"id": item_id})
    if not cart_item or cart_item.cart_number != cart.cart_number:
        raise HTTPException(status_code=404, detail="cart item not found")

    decrement = cart_item.price * cart_item.quantity
    subtotal = cart.subtotal - decrement
    service = ShopSettingsService()
    tax = subtotal * (float(await service.get("tax_rate")) / 100)
    total = subtotal + tax + cart.shipping_fee - cart.discount_amount

    async with db.tx() as tx:
        await tx.cartitem.delete(where={"id": item_id})
        await tx.cart.update(
            where={"cart_number": cart.cart_number},
            data={"subtotal": subtotal, "tax": tax, "total": total},
        )

    await bust(f"cart:{cart.cart_number}")
    if cart.user_id:
        await bust(f"cart:{cart.user_id}")
    await invalidate_pattern("abandoned-carts")
    return {"message": "Item removed from cart successfully"}


@router.put("/items/{item_id}", response_model=CartItemResponse)
async def update_cart_item(item_id: int, quantity: int, user: UserDep, background_tasks: BackgroundTasks, cartId: str = Header(default=None)):
    cart = await get_or_create_cart(cart_number=cartId, user_id=user.id if user else None)
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


async def send_abandoned_cart_reminder(cart_id: int):
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
            logger.error(f"Cart with ID {cart_id} not found")
            return

        if not cart.user:
            logger.warning(f"Cart {cart_id} has no associated user, skipping email")
            return

        if not cart.email and not cart.user.email:
            logger.warning(f"Cart {cart_id} has no email address, skipping email")
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
            "created_at": cart.created_at,
            "updated_at": cart.updated_at
        }

        email_data = await generate_abandoned_cart_email(
            cart_data=cart_data,
            user_email=cart.email or cart.user.email,
            user_name=cart.user.first_name or cart.user.username
        )

        await send_email(
            email_to=cart.email or cart.user.email,
            subject=email_data.subject,
            html_content=email_data.html_content
        )

        logger.info(f"Abandoned cart reminder sent to {cart.email or cart.user.email} for cart {cart.cart_number}")

    except Exception as e:
        logger.error(f"Failed to send abandoned cart reminder for cart {cart_id}: {str(e)}")


class SendAbandonedCartReminders(BaseModel):
    hours_threshold: int
    limit: int = 50


@router.post("/abandoned-carts/send-reminders")
async def send_abandoned_cart_reminders(
    background_tasks: BackgroundTasks,
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
            background_tasks.add_task(send_abandoned_cart_reminder, cart.id)

        logger.info(f"Queued {len(abandoned_carts)} abandoned cart reminders")

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


@router.get("/abandoned-carts", dependencies=[Depends(get_current_superuser)])
@cache_response(key_prefix="abandoned-carts")
async def get_admin_abandoned_carts(
    request: Request,
    search: Optional[str] = None,
    hours_threshold: int = 24,
    skip: int = 0,
    limit: int = 20
):
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
            skip=skip,
            take=limit,
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

        total_count = await db.cart.count(where=where_clause)

        return {
            "carts": carts,
            "skip": skip,
            "limit": limit,
            "total_count": total_count,
            "total_pages": (total_count + limit - 1) // limit
        }

    except Exception as e:
        logger.error(f"Failed to get admin abandoned carts: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get admin abandoned carts: {str(e)}"
        )


@router.post("/abandoned-carts/{cart_id}/send-reminder", dependencies=[Depends(get_current_superuser)])
async def send_cart_reminder(
    cart_id: int,
    background_tasks: BackgroundTasks
):
    """
    Send a recovery email reminder for a specific abandoned cart.
    """
    try:
        cart = await db.cart.find_unique(
            where={"id": cart_id, "user_id": {"not": None}},
        )

        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")

        background_tasks.add_task(send_abandoned_cart_reminder, cart.id)

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


@router.get("/abandoned-carts/stats", dependencies=[Depends(get_current_superuser)])
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
