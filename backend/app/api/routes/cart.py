from typing import Any

from fastapi import APIRouter, Header, HTTPException
from firebase_cart import CartHandler, CartItem, FirebaseConfig

from app.core import deps
from app.core.config import settings
from app.core.utils import generate_id
from app.models.generic import CartDetails, CartItemIn
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
def index(
    cartId: str = Header(default=None),
) -> Any:
    """
    Retrieve cart.
    """
    return cart_handler.get_cart(cart_id=cartId)


@router.post("/add")
async def add_to_cart(
    cart_in: CartItemIn, service: deps.SearchService, cartId: str = Header(default=None)
):

    doc = await service.get_product(product_id=cart_in.product_id)
    id = str(doc.get("id"))
    cart_item = CartItem(**doc, item_id=id, product_id=id, quantity=cart_in.quantity)
    return cart_handler.add_to_cart(cart_id=cartId, item=cart_item)


@router.post("/create")
async def create_cart():
    id = generate_id()
    return cart_handler.create_cart(cart_id=id, customer_id="", email="")


@router.post("/update")
async def update_cart(cart_in: CartItemIn, cartId: str = Header(default=None)):
    return cart_handler.update_cart_quantity(
        cart_id=cartId, product_id=cart_in.product_id, quantity=cart_in.quantity
    )


@router.patch("/update-cart-details")
async def update_cart_details(
    cart_update: CartDetails, cartId: str = Header(default=None)
):
    update_data = cart_update.dict(exclude_unset=True)
    return cart_handler.update_cart_details(cart_id=cartId, cart_data=update_data)


@router.delete("/{id}")
def delete(id: str, cartId: str = Header(default=None)) -> Message:
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
