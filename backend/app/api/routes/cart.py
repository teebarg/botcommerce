from typing import Optional

from app.core.utils import generate_id
from app.models.generic import Message
from app.models.cart import CartUpdate, CartItemCreate, CartItemResponse, CartResponse
from fastapi import APIRouter, Header, HTTPException, Request, BackgroundTasks
from app.prisma_client import prisma as db
from app.core.deps import TokenUser, ShopSettingsServiceDep
from prisma.models import Cart
from app.services.redis import cache_response, invalidate_key
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()

async def calculate_cart_totals(cart: Cart, tax_rate: float):
    """Helper function to calculate cart totals"""
    cart_items = await db.cartitem.find_many(where={"cart_id": cart.id})

    subtotal = sum(item.price * item.quantity for item in cart_items)
    tax = subtotal * (tax_rate / 100)

    total = subtotal + tax + cart.shipping_fee

    await db.cart.update(
        where={"id": cart.id},
        data={"subtotal": subtotal, "tax": tax, "total": total}
    )


async def get_or_create_cart(cartId: Optional[str]):
    """Retrieve an existing cart or create a new one if it doesn't exist"""
    if not cartId:
        new_cart_id = generate_id()
        return await db.cart.create(data={"cart_number": new_cart_id})

    cart = await db.cart.find_unique(where={"cart_number": cartId})
    if cart is not None:
        return cart

    new_cart_id = generate_id()
    return await db.cart.create(data={"cart_number": new_cart_id})


@router.post("/items")
async def add_item_to_cart(
    item_in: CartItemCreate,
    shop_settings_service: ShopSettingsServiceDep,
    background_tasks: BackgroundTasks,
    cartId: str = Header(default=None)
):
    cart = await get_or_create_cart(cartId)

    variant = await db.productvariant.find_unique(
        where={"id": item_in.variant_id},
        include={"product": {"include": {"images": True}}}
    )

    if not variant:
        raise HTTPException(status_code=400, detail="Variant does not exist")
    if variant.status != "IN_STOCK":
        raise HTTPException(status_code=400, detail="Variant is out of stock")

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

    tax_rate = float(await shop_settings_service.get("tax_rate"))

    async with db.tx() as tx:
        item = await tx.cartitem.create(
            data={
                "cart_id": cart.id,
                "cart_number": cart.cart_number,
                "name": variant.product.name,
                "slug": variant.product.slug,
                "variant_id": item_in.variant_id,
                "quantity": item_in.quantity,
                "price": variant.price,
                "image": variant.product.images[0].image if variant.product.images else variant.product.image
            }
        )

        increment = item.price * item.quantity
        subtotal = cart.subtotal + increment
        tax = subtotal * (tax_rate / 100)
        total = subtotal + tax + cart.shipping_fee

        await tx.cart.update(
            where={"cart_number": cart.cart_number},
            data={"subtotal": subtotal, "tax": tax, "total": total},
        )

    background_tasks.add_task(calculate_cart_totals, cart, tax_rate)
    await invalidate_key(f"cart:{cart.cart_number}")

    return item


@router.get("/", response_model=Optional[CartResponse])
@cache_response(key_prefix="cart", key=lambda request, cartId, **kwargs: cartId)
async def get_cart(request: Request, cartId: str = Header()):
    """Get a specific cart by ID"""
    if not cartId:
        return None

    return await db.cart.find_unique(where={"cart_number": cartId}, include={"items": {"include": {"variant": True}}, "shipping_address": True})


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

    await invalidate_key(f"cart:{cartId}")

    return updated_cart


@router.delete("/")
async def delete(cartId: str = Header(default=None)) -> Message:
    """
    Delete item from cart.
    """
    cart = await db.cart.find_unique(where={"cart_number": cartId})
    if not cart:
        raise HTTPException(status_code=404, detail="cart not found")

    await db.cart.delete(where={"cart_number": cartId})
    await invalidate_key(f"cart:{cartId}")
    return {"message": "cart deleted successfully"}


@router.delete("/items/{item_id}")
async def delete_cart_item(item_id: int, shop_settings_service: ShopSettingsServiceDep, cartId: str = Header(default=None)):
    cart_item = await db.cartitem.find_unique(where={"id": item_id})
    if not cart_item or cart_item.cart_number != cartId:
        raise HTTPException(status_code=404, detail="cart item not found")

    cart = await db.cart.find_unique(where={"cart_number": cartId})

    decrement = cart_item.price * cart_item.quantity
    subtotal = cart.subtotal - decrement
    tax = subtotal * (float(await shop_settings_service.get("tax_rate")) / 100)
    total = subtotal + tax + cart.shipping_fee

    async with db.tx() as tx:
        await tx.cartitem.delete(where={"id": item_id})
        await tx.cart.update(
            where={"cart_number": cartId},
            data={"subtotal": subtotal, "tax": tax, "total": total},
        )

    await invalidate_key(f"cart:{cartId}")
    return {"message": "Item removed from cart successfully"}


@router.put("/items/{item_id}")
async def update_cart_item(item_id: int, quantity: int, shop_settings_service: ShopSettingsServiceDep, cartId: str = Header(default=None)):
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

    old_qty = cart_item.quantity
    diff = (quantity - old_qty) * cart_item.price

    async with db.tx() as tx:
        updated_item = await tx.cartitem.update(
            where={"id": item_id},
            data={"quantity": quantity},
        )

        subtotal = cart_item.cart.subtotal + diff
        tax = subtotal * (float(await shop_settings_service.get("tax_rate")) / 100)
        total = subtotal + tax + cart_item.cart.shipping_fee

        await tx.cart.update(
            where={"cart_number": cartId},
            data={"subtotal": subtotal, "tax": tax, "total": total},
        )
    await invalidate_key(f"cart:{cartId}")
    return updated_item
