from typing import Optional
from datetime import datetime, timedelta

from app.core.utils import generate_id, generate_abandoned_cart_email, send_email
from app.models.cart import CartUpdate, CartItemCreate, CartItemResponse, CartResponse
from fastapi import APIRouter, Header, HTTPException, Request, BackgroundTasks
from app.prisma_client import prisma as db
from app.core.deps import TokenUser, UserDep
from prisma.models import Cart
from app.services.redis import cache_response, invalidate_key, bust
from app.core.logging import get_logger
from app.services.shop_settings import ShopSettingsService
from prisma.enums import CartStatus

logger = get_logger(__name__)

router = APIRouter()

async def calculate_cart_totals(cart: Cart):
    """Helper function to calculate cart totals"""
    service = ShopSettingsService()
    tax_rate = float(await service.get("tax_rate"))
    cart_items = await db.cartitem.find_many(where={"cart_id": cart.id})

    subtotal = sum(item.price * item.quantity for item in cart_items)
    tax = subtotal * (tax_rate / 100)

    total = subtotal + tax + cart.shipping_fee

    await db.cart.update(
        where={"id": cart.id},
        data={"subtotal": subtotal, "tax": tax, "total": total}
    )

    if cart.user_id:
        await bust(f"cart:{cart.user_id}")
    await bust(f"cart:{cart.cart_number}")


async def get_or_create_cart(cart_number: Optional[str], user_id: Optional[str]):
    """Retrieve an existing cart or create a new one if it doesn't exist"""
    if user_id:
        cart = await db.cart.find_first(
            where={"user_id": user_id, "status": CartStatus.ACTIVE},
            order={"updated_at": "desc"}
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
async def get_cart_items(cartId: str = Header()):
    """Get all items in a specific cart"""
    if not cartId:
        return None
    return await db.cartitem.find_many(where={"cart_number": cartId}, include={"variant": True})


@router.put("/", response_model=CartResponse)
async def update_cart(cart_update: CartUpdate, token_data: TokenUser, cartId: str = Header(default=None)):
    """Update cart status"""
    cart = await db.cart.find_unique(where={"cart_number": cartId})
    if not cart:
        cart = await db.cart.create(
            data={
                "cart_number": cartId
            },
        )

    user = await db.user.find_unique(where={"email": token_data.sub}) if token_data else None

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

    if cart_update.payment_method:
        update_data["payment_method"] = cart_update.payment_method

    if cart_update.shipping_method:
        update_data["shipping_method"] = cart_update.shipping_method

    if cart_update.shipping_fee is not None:
        update_data["shipping_fee"] = cart_update.shipping_fee
        update_data["total"] = cart.subtotal + cart.tax + update_data["shipping_fee"]

    if user:
        update_data["user"] = {"connect": {"id": user.id}}

    updated_cart = await db.cart.update(
        where={"cart_number": cartId},
        data=update_data,
    )

    if cart_update.shipping_address:
        await invalidate_key(f"addresses:{user.id}")

    await bust(f"cart:{cartId}")
    if cart.user_id:
        await bust(f"cart:{cart.user_id}")

    return updated_cart


@router.delete("/items/{item_id}")
async def delete_cart_item(item_id: int, cartId: str = Header(default=None)):
    cart_item = await db.cartitem.find_unique(where={"id": item_id})
    if not cart_item or cart_item.cart_number != cartId:
        raise HTTPException(status_code=404, detail="cart item not found")

    cart = await db.cart.find_unique(where={"cart_number": cartId})

    decrement = cart_item.price * cart_item.quantity
    subtotal = cart.subtotal - decrement
    service = ShopSettingsService()
    tax = subtotal * (float(await service.get("tax_rate")) / 100)
    total = subtotal + tax + cart.shipping_fee

    async with db.tx() as tx:
        await tx.cartitem.delete(where={"id": item_id})
        await tx.cart.update(
            where={"cart_number": cartId},
            data={"subtotal": subtotal, "tax": tax, "total": total},
        )

    await bust(f"cart:{cartId}")
    if cart.user_id:
        await bust(f"cart:{cart.user_id}")
    return {"message": "Item removed from cart successfully"}


@router.put("/items/{item_id}", response_model=CartItemResponse)
async def update_cart_item(item_id: int, quantity: int, background_tasks: BackgroundTasks, cartId: str = Header(default=None)):
    cart_item = await db.cartitem.find_unique(
        where={"id": item_id},
        include={"cart": True, "variant": True}
    )
    if not cart_item or cart_item.cart_number != cartId:
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

    background_tasks.add_task(calculate_cart_totals, cart=cart_item.cart)

    return updated_item


async def send_abandoned_cart_reminder(cart_id: int):
    """Background task to send abandoned cart reminder email"""
    try:
        # Get cart with user and items
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
            
        # Prepare cart data for email template
        cart_data = {
            "id": cart.id,
            "cart_number": cart.cart_number,
            "total": cart.total,
            "subtotal": cart.subtotal,
            "tax": cart.tax,
            "shipping_fee": cart.shipping_fee,
            "items": [
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
        
        # Generate and send email
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


@router.post("/send-abandoned-cart-reminders")
async def send_abandoned_cart_reminders(
    background_tasks: BackgroundTasks,
    hours_threshold: int = 24,
    limit: int = 50
):
    """
    Send reminder emails to users with abandoned carts.
    
    Args:
        hours_threshold: Hours after which a cart is considered abandoned (default: 24)
        limit: Maximum number of carts to process (default: 50)
    """
    try:
        # Calculate the threshold time
        threshold_time = datetime.utcnow() - timedelta(hours=hours_threshold)
        
        # Find abandoned carts
        abandoned_carts = await db.cart.find_many(
            where={
                "status": CartStatus.ACTIVE,
                "updated_at": {"lt": threshold_time},
                "user_id": {"not": None},
                "OR": [
                    {"user": {"email": {"not": None}}}  # User has email
                ]
            },
            include={
                "user": True,
                "items": True
            },
            take=limit,
            order={"updated_at": "asc"}
        )
        
        if not abandoned_carts:
            return {
                "message": "No abandoned carts found",
                "carts_processed": 0,
                "threshold_hours": hours_threshold
            }
        
        for cart in abandoned_carts:
            background_tasks.add_task(send_abandoned_cart_reminder, cart.id)
        
        logger.info(f"Queued {len(abandoned_carts)} abandoned cart reminders")
        
        return {
            "message": f"Abandoned cart reminders queued successfully",
            "carts_processed": len(abandoned_carts),
            "threshold_hours": hours_threshold,
            "carts": [
                {
                    "cart_id": cart.id,
                    "cart_number": cart.cart_number,
                    "user_email": cart.email or cart.user.email if cart.user else None,
                    "total": cart.total,
                    "items_count": len(cart.items),
                    "last_updated": cart.updated_at
                }
                for cart in abandoned_carts
            ]
        }
        
    except Exception as e:
        logger.error(f"Failed to process abandoned cart reminders: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process abandoned cart reminders: {str(e)}"
        )


@router.post("/mark-cart-abandoned/{cart_number}")
async def mark_cart_abandoned(cart_number: str):
    """Mark a specific cart as abandoned"""
    try:
        cart = await db.cart.find_unique(where={"cart_number": cart_number})
        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")
        
        updated_cart = await db.cart.update(
            where={"cart_number": cart_number},
            data={"status": CartStatus.ABANDONED}
        )
        
        await bust(f"cart:{cart_number}")
        if cart.user_id:
            await bust(f"cart:{cart.user_id}")
        
        return {
            "message": "Cart marked as abandoned",
            "cart_number": cart_number,
            "status": updated_cart.status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to mark cart {cart_number} as abandoned: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to mark cart as abandoned: {str(e)}"
        )


@router.get("/abandoned-carts")
async def get_abandoned_carts(
    hours_threshold: int = 24,
    limit: int = 20
):
    """
    Get list of abandoned carts without sending emails.
    Useful for testing and monitoring.
    """
    try:
        threshold_time = datetime.utcnow() - timedelta(hours=hours_threshold)
        
        abandoned_carts = await db.cart.find_many(
            where={
                "status": CartStatus.ACTIVE,
                "updated_at": {"lt": threshold_time},
                "user_id": {"not": None},
                "OR": [
                    {"email": {"not": None}},
                    {"user": {"email": {"not": None}}}
                ]
            },
            include={
                "user": True,
                "items": True
            },
            take=limit,
            order={"updated_at": "asc"}
        )
        
        return {
            "message": f"Found {len(abandoned_carts)} abandoned carts",
            "threshold_hours": hours_threshold,
            "carts": [
                {
                    "cart_id": cart.id,
                    "cart_number": cart.cart_number,
                    "user_email": cart.email or cart.user.email if cart.user else None,
                    "user_name": cart.user.first_name or cart.user.username if cart.user else None,
                    "total": cart.total,
                    "items_count": len(cart.items),
                    "last_updated": cart.updated_at,
                    "items": [
                        {
                            "name": item.name,
                            "quantity": item.quantity,
                            "price": item.price
                        }
                        for item in cart.items
                    ]
                }
                for cart in abandoned_carts
            ]
        }
        
    except Exception as e:
        logger.error(f"Failed to get abandoned carts: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get abandoned carts: {str(e)}"
        )
