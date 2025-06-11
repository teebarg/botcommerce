from typing import Optional

from app.core.utils import generate_id
from app.models.generic import Message
from app.models.cart import CartUpdate, CartItemCreate, CartItemResponse, CartResponse
from fastapi import APIRouter, Header, HTTPException
from app.prisma_client import prisma as db
from app.core.deps import TokenUser
from prisma.models import Cart

# Create a router for carts
router = APIRouter()

async def calculate_cart_totals(cart: Cart):
    """Helper function to calculate cart totals"""
    cart_items = await db.cartitem.find_many(where={"cart_id": cart.id})

    subtotal = sum(item.price * item.quantity for item in cart_items)
    tax = subtotal * 0.05  # 5% tax rate

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
    if cart:
        return cart

    raise HTTPException(status_code=404, detail="Cart not found")


@router.post("/items")
async def add_item_to_cart(item: CartItemCreate, cartId: str = Header(default=None)) -> CartResponse:
    """Add an item to cart"""
    cart = await get_or_create_cart(cartId)

    # Verify product variant exists and is in stock
    variant = await db.productvariant.find_unique(
        where={"id": item.variant_id},
        include={"product": {"include": {"images": True, "name": True, "slug": True}}}
    )

    if not variant:
        raise HTTPException(status_code=400, detail="Variant does not exist")
    if variant.status != "IN_STOCK":
        raise HTTPException(status_code=400, detail="Variant is out of stock")

    # Check if item already exists in cart
    existing_item = await db.cartitem.find_first(
        where={"cart_id": cart.id, "variant_id": item.variant_id}
    )

    if existing_item:
        # Update quantity if item exists
        await db.cartitem.update(
            where={"id": existing_item.id},
            data={"quantity": existing_item.quantity + item.quantity},
        )
    else:
        # Create new cart item
        await db.cartitem.create(
            data={
                "cart_id": cart.id,
                "cart_number": cart.cart_number,
                "name": variant.product.name,
                "slug": variant.product.slug,
                "variant_id": item.variant_id,
                "quantity": item.quantity,
                "price": variant.price,
                "image": variant.product.images[0].image if variant.product.images else variant.product.image
            },
        )

    # Update cart totals
    await calculate_cart_totals(cart=cart)

    return cart


# Endpoints
@router.get("/", response_model=Optional[CartResponse])
async def get_cart(cartId: str = Header()):
    """Get a specific cart by ID"""
    if not cartId:
        return None

    return await db.cart.find_unique(where={"cart_number": cartId})


@router.get("/items", response_model=Optional[list[CartItemResponse]])
async def get_cart_items(cartId: str = Header()):
    """Get all items in a specific cart"""
    if not cartId:
        return None
    return await db.cartitem.find_many(where={"cart_number": cartId})


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

    if cart_update.payment_method:
        update_data["payment_method"] = cart_update.payment_method

    if cart_update.shipping_method:
        update_data["shipping_method"] = cart_update.shipping_method

    if cart_update.shipping_fee is not None:
        update_data["shipping_fee"] = cart_update.shipping_fee
        update_data["total"] = cart.subtotal + cart.tax + update_data["shipping_fee"]

    update_data["user"] = {"connect": {"id": user.id}} if user else {"disconnect": True}

    updated_cart = await db.cart.update(
        where={"cart_number": cartId},
        data=update_data,
    )
    return updated_cart


@router.delete("/")
async def delete(cartId: str = Header(default=None)) -> Message:
    """
    Delete item from cart.
    """
    cart = await db.cart.find_unique(where={"cart_number": cartId})
    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    await db.cart.delete(where={"cart_number": cartId})
    return {"message": "Cart deleted successfully"}


@router.delete("/items/{item_id}")
async def remove_item_from_cart(item_id: int, cartId: str = Header(default=None)):
    """Remove an item from cart"""
    cart_item = await db.cartitem.find_unique(where={"id": item_id}, include={"cart": True})
    if not cart_item or cart_item.cart_number != cartId:
        raise HTTPException(status_code=404, detail="Cart item not found")

    try:
        await db.cartitem.delete(where={"id": item_id})
        await calculate_cart_totals(cart=cart_item.cart)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "Item removed from cart successfully"}


@router.put("/items/{item_id}")
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
    )
    # Update cart totals
    await calculate_cart_totals(cart=cart_item.cart)
    return updated_item
