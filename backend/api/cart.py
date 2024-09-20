from core.utils import generate_id
from services.meilisearch import get_document_by_id
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Header
)

import crud
from core.deps import (
    SessionDep,
    UserCart,
    get_current_user,
)
from models.generic import CartDetails, CartItemIn, CartPublic
from models.message import Message
from firebase_cart import CartHandler, CartItem, Cart, FirebaseConfig
from typing import Any
from core.config import settings

firebase_config = FirebaseConfig(
    credentials=settings.FIREBASE_CRED,
    database_url=settings.DATABASE_URL
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
async def add_to_cart(cart_in: CartItemIn, cartId: str = Header(default=None)):
    doc = get_document_by_id("products", cart_in.product_id)
    id = str(doc.get("id"))
    cart_item = CartItem(**doc, item_id=id, product_id=id, quantity=cart_in.quantity)
    return cart_handler.add_to_cart(cart_id=cartId, item=cart_item)


@router.post("/create")
async def create_cart():
    id = generate_id()
    return cart_handler.create_cart(cart_id=id, customer_id="", email="")


@router.post("/update")
async def update_cart(cart_in: CartItemIn, cartId: str = Header(default=None)):
    return cart_handler.update_cart_quantity(cart_id=cartId, product_id=cart_in.product_id, quantity=cart_in.quantity)


@router.post("/update-cart-details")
async def update_cart_details(cart_update: CartDetails, cartId: str = Header(default=None)):
    return cart_handler.update_cart_details(cart_id=cartId, cart_data=cart_update)


@router.delete("/{id}", dependencies=[Depends(get_current_user)])
def delete(db: SessionDep, id: int) -> Message:
    """
    Delete a cart.
    """
    try:
        cart = crud.cart.get(db=db, id=id)
        if not cart:
            raise HTTPException(status_code=404, detail="Cart not found")
        crud.cart.remove(db=db, id=id)
        return Message(message="Cart deleted successfully")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        ) from e
