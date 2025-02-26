from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Header, HTTPException, Response
from firebase_cart import CartHandler, CartItem, FirebaseConfig

from app.core.config import settings
from app.core.deps import CacheService, SessionDep
from app.core.utils import generate_id
from app.models.generic import CartDetails, CartItemIn, Product
from app.models.message import Message

firebase_config = FirebaseConfig(
    credentials=settings.FIREBASE_CRED,
    database_url=settings.DATABASE_URL,
    bucket=settings.STORAGE_BUCKET,
)

cart_handler = CartHandler(firebase_config)

# Create a router for carts
router = APIRouter()


@router.get("/")
async def index(response: Response, cartId: str = Header(default=None)) -> Any:
    """
    Retrieve cart.
    """
    if not cartId:
        id = generate_id()
        cart = cart_handler.create_cart(cart_id=id, customer_id="", email="")
        response.set_cookie(
            key="_cart_id",
            value=id,
            max_age=timedelta(days=7),
            secure=True,
            httponly=True,
        )
        return cart_handler.get_cart(cart_id=cart.get("cart_id"))
    return cart_handler.get_cart(cart_id=cartId)


@router.post("/add")
async def add_to_cart(
    db: SessionDep,
    cart_in: CartItemIn,
    cartId: str = Header(default=None),
):

    doc = db.get(Product, cart_in.product_id)
    if not doc:
        raise HTTPException(
            status_code=400,
            detail="Could not find product",
        )
    id = str(doc.id)
    cart_item = CartItem(**doc.dict(), item_id=id, product_id=id, quantity=cart_in.quantity)
    try:
        return cart_handler.add_to_cart(cart_id=cartId, item=cart_item)
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


@router.patch("/update")
async def update_cart(cart_in: CartItemIn, cache: CacheService, cartId: str = Header(default=None)):
    try:
        cart = cart_handler.update_cart_quantity(
            cart_id=cartId, product_id=cart_in.product_id, quantity=cart_in.quantity
        )
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
        return cart_handler.update_cart_details(cart_id=cartId, cart_data=update_data)
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
        return cart_handler.remove_from_cart(cart_id=cartId, item_id=id)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        ) from e
