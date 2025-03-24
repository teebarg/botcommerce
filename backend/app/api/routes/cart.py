from datetime import timedelta

from app.core.utils import generate_id
from app.models.generic import Message
from app.models.cart import CartCreate, CartUpdate, CartItemCreate, CartItemResponse, CartResponse
from fastapi import APIRouter, Header, HTTPException, Response
from app.prisma_client import prisma as db
from app.core.deps import CurrentUser, TokenUser

# Create a router for carts
router = APIRouter()


# Endpoints
@router.post("/", response_model=CartResponse)
async def create_cart(response: Response, cart: CartCreate):
    """Create a new cart for a user"""
    id = generate_id()
    # Check if user exists
    user = await db.user.find_unique(where={"id": cart.cart_number})
    # if not user:
    #     raise HTTPException(status_code=404, detail="User not found")

    # Check if user already has an active cart
    existing_cart = await db.cart.find_first(
        where={
            "cart_number": cart.cart_number,
            "status": "ACTIVE"
        },
        include={
            "items": {
                "include": {
                    "variant": True
                }
            }
        }
    )
    if existing_cart:
        raise HTTPException(
            status_code=400, detail="User already has an active cart")

    new_cart = await db.cart.create(
        data={
            "user_id": user or None,
            "cart_number": id
        },
        include={
            "items": {
                "include": {
                    "variant": True
                }
            }
        }
    )
    response.set_cookie(
        key="_cart_id",
        value=id,
        max_age=timedelta(days=7),
        secure=True,
        httponly=True,
        samesite="Lax",
    )
    return new_cart


@router.get("/", response_model=CartResponse)
async def get_cart(response: Response, cartId: str = Header()):
    """Get a specific cart by ID"""
    cart = None
    if cartId:
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
    if not cart:
        print("no cart")
        # id = generate_id()
        new_cart = await db.cart.create(
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
        # response.set_cookie(
        #     key="_cart_id",
        #     value=id,
        #     max_age=timedelta(days=7),
        #     secure=True,
        #     httponly=True,
        #     samesite="Lax",
        # )
        return new_cart
    return cart


@router.put("/", response_model=CartResponse)
async def update_cart(cart_update: CartUpdate, token_data: TokenUser, cartId: str = Header(default=None)):
    """Update cart status"""
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

    # update_data = cart_update.dict(exclude_unset=True)
    # if cart_update.status:
    #     update_data["status"] = cart_update.status

    update_data = {}

    if cart_update.status:
        update_data["status"] = cart_update.status

    if cart_update.email:
        update_data["email"] = cart_update.email

    if cart_update.shipping_address:
        update_data["shipping_address"] = {"create": {
            **cart_update.shipping_address.dict(), "user_id": user.id if user else None}}

    if cart_update.billing_address:
        update_data["billing_address"] = {"create": {
            **cart_update.billing_address.dict(), "user_id": user.id if user else None}}

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


@router.post("/items", response_model=CartItemResponse)
async def add_item_to_cart(response: Response, item: CartItemCreate, cartId: str = Header(default=None)):
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
        response.set_cookie(
            key="_cart_id",
            value=id,
            max_age=timedelta(days=7),
            secure=True,
            httponly=True,
            samesite="Lax",
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
    new_item = await db.cartitem.create(
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
    return new_item


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
