from typing import Any

from app.services.product import get_product
from fastapi import APIRouter, Header, HTTPException
from firebase_cart import CartHandler, CartItem, FirebaseConfig

from app.core.config import settings
from app.core.utils import generate_id
from app.models.generic import CartDetails, CartItemIn
from app.models.message import Message
from app.core.decorators import cache
from app.core.deps import ( CacheService )

firebase_config = FirebaseConfig(
    credentials=settings.FIREBASE_CRED,
    database_url=settings.DATABASE_URL,
    bucket=settings.STORAGE_BUCKET,
)

cart_handler = CartHandler(firebase_config)

# Create a router for carts
router = APIRouter()


@router.get("/")
@cache(key="cart", hash=False)
async def index(cartId: str = Header(default=None)) -> Any:
    """
    Retrieve cart.
    """
    return cart_handler.get_cart(cart_id=cartId)


@router.post("/add")
async def add_to_cart(
    cart_in: CartItemIn,
    cache: CacheService,
    cartId: str = Header(default=None),
):

    doc = await get_product(cache=cache, product_id=cart_in.product_id)
    id = str(doc.get("id"))
    cart_item = CartItem(**doc, item_id=id, product_id=id, quantity=cart_in.quantity)
    try:
        cart = cart_handler.add_to_cart(cart_id=cartId, item=cart_item)    
        # Invalidate cache
        cache.delete("cart")
        return cart
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"{e}",
        ) from e


@router.post("/create")
async def create_cart():
    id = generate_id()
    try:
        return cart_handler.create_cart(cart_id=id, customer_id="", email="")    
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"{e}",
        ) from e


@router.post("/update")
async def update_cart(cart_in: CartItemIn, cache: CacheService, cartId: str = Header(default=None)):
    try:
        cart = cart_handler.update_cart_quantity(
            cart_id=cartId, product_id=cart_in.product_id, quantity=cart_in.quantity
        )    
        # Invalidate cache
        cache.delete(f"cart:{cartId}")
        return cart
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"{e}",
        ) from e


@router.patch("/update-cart-details")
async def update_cart_details(
    cart_in: CartDetails, cache: CacheService, cartId: str = Header(default=None)
):
    try:
        update_data = cart_in.dict(exclude_unset=True)
        cart = cart_handler.update_cart_details(cart_id=cartId, cart_data=update_data)
   
        # Invalidate cache
        cache.delete(f"cart:{cartId}")
        return cart
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"{e}",
        ) from e


@router.delete("/{id}")
async def delete(id: str, cache: CacheService, cartId: str = Header(default=None)) -> Message:
    """
    Delete item from cart.
    """
    try:
        cart = cart_handler.remove_from_cart(cart_id=cartId, item_id=id)
        # Invalidate cache
        cache.delete(f"cart:{cartId}")
        return cart
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        ) from e
