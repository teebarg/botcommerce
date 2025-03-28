from datetime import timedelta
from typing import Optional

from app.core.utils import generate_id
from app.models.generic import Message
from app.models.cart import CartUpdate, CartItemCreate, CartItemResponse, CartResponse
from fastapi import APIRouter, Header, HTTPException, Response
from app.prisma_client import prisma as db
from app.core.deps import TokenUser

# Create a router for carts
router = APIRouter()


# Endpoints
@router.get("/", response_model=Optional[CartResponse])
async def get_cart(cartId: str = Header()):
    """Get a specific cart by ID"""
    cart = None

    if not cartId:
        return None

    cart = await db.cart.find_unique(
        where={"cart_number": cartId},
        include={
            "items": {
                "include": {
                    "variant": True
                }
            },
            "shipping_address": True,
            "billing_address": True
        }
    )
    return cart


@router.put("/", response_model=CartResponse)
async def update_cart(cart_update: CartUpdate, token_data: TokenUser, cartId: str = Header(default=None)):
    """Update cart status"""
    print("🚀 ~ cart_update:", cart_update)
    cart = await db.cart.find_unique(where={"cart_number": cartId})
    if not cart:
        cart = await db.cart.create(
            data={
                "cart_number": cartId
            },
            include={
                "items": {
                    "include": {
                        "variant": True
                    }
                }
            }
        )
        # raise HTTPException(status_code=404, detail="Cart not found")

    user = await db.user.find_unique(where={"email": token_data.sub}) if token_data else None

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

    # update_data = cart_update.dict(exclude_unset=True)
    # if cart_update.status:
    #     update_data["status"] = cart_update.status

    update_data = {}

    if cart_update.status:
        update_data["status"] = cart_update.status

    if cart_update.email:
        update_data["email"] = cart_update.email

    if cart_update.shipping_address:
        update_data["shipping_address"] = {"connect": {"id": address.id}}
        update_data["billing_address"] = {"connect": {"id": address.id}}

    # if cart_update.billing_address:
    #     update_data["billing_address"] = {"create": {
    #         **cart_update.billing_address.model_dump(), "user_id": user.id if user else None}}

    if cart_update.payment_method:
        update_data["payment_method"] = cart_update.payment_method

    if cart_update.shipping_method:
        update_data["shipping_method"] = cart_update.shipping_method

    if cart_update.total:
        update_data["total"] = cart_update.total

    if cart_update.subtotal:
        update_data["subtotal"] = cart_update.subtotal

    if cart_update.tax:
        update_data["tax"] = cart_update.tax

    if cart_update.shipping_fee is not None:
        update_data["shipping_fee"] = cart_update.shipping_fee

    update_data["user"] = {"connect": {"id": user.id}} if user else {"disconnect": True}

    updated_cart = await db.cart.update(
        where={"cart_number": cartId},
        data=update_data,
        include={
            "items": {
                "include": {
                    "variant": True
                }
            },
            "shipping_address": True,
            "billing_address": True,
        }
    )
    return updated_cart


@router.delete("/{id}")
async def delete(id: str, cartId: str = Header(default=None)) -> Message:
    """
    Delete item from cart.
    """
    cart = await db.cart.find_unique(where={"cart_number": cartId})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    await db.cart.delete(where={"cart_number": cartId})
    return {"message": "Cart deleted successfully"}


@router.post("/items")
async def add_item_to_cart(item: CartItemCreate, cartId: str = Header(default=None)) -> CartResponse:
    """Add an item to cart"""
    # Verify cart exists
    cart = await db.cart.find_unique(where={"cart_number": cartId})
    if not cart:
        id = generate_id()
        cart = await db.cart.create(
            data={
                "cart_number": id
            },
        )

    # Verify product variant exists and is in stock
    variant = await db.productvariant.find_unique(where={"id": item.variant_id}, include={"product": True})
    if not variant or variant.status != "IN_STOCK":
        raise HTTPException(status_code=400, detail="Variant not available")

    # Check if item already exists in cart
    existing_item = await db.cartitem.find_first(
        where={
            "cart_id": cart.id,
            "variant_id": item.variant_id
        }
    )

    if existing_item:
        # Update quantity if item exists
        updated_item = await db.cartitem.update(
            where={"id": existing_item.id},
            data={"quantity": existing_item.quantity + item.quantity},
            include={
                "variant": True
            }
        )
        return updated_item

    # Create new cart item
    await db.cartitem.create(
        data={
            "cart_id": cart.id,
            "variant_id": item.variant_id,
            "quantity": item.quantity,
            "price": variant.price,
            "image": variant.product.image
        },
        include={
            "variant": True
        }
    )
    return cart


@router.delete("/items/{item_id}")
async def remove_item_from_cart(item_id: int, cartId: str = Header(default=None)):
    """Remove an item from cart"""
    cart_item = await db.cartitem.find_unique(where={"id": item_id}, include={"cart": True})
    if not cart_item or cart_item.cart.cart_number != cartId:
        raise HTTPException(status_code=404, detail="Cart item not found")

    await db.cartitem.delete(where={"id": item_id})
    return {"message": "Item removed from cart successfully"}


@router.put("/items/{item_id}", response_model=CartItemResponse)
async def update_cart_item_quantity(item_id: int, quantity: int, cartId: str = Header(default=None)):
    """Update quantity of an item in cart"""
    cart_item = await db.cartitem.find_unique(where={"id": item_id}, include={"cart": True})

    if not cart_item or cart_item.cart.cart_number != cartId:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if quantity <= 0:
        raise HTTPException(
            status_code=400, detail="Quantity must be greater than 0")

    updated_item = await db.cartitem.update(
        where={"id": item_id},
        data={"quantity": quantity},
        include={
            "variant": True
        }
    )
    return updated_item
