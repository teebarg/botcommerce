from fastapi import (
    APIRouter,
    HTTPException,
)

import crud
from core.deps import (
    SessionDep,
    UserCart,
)
from models.cart_item import (
    CartItemCreate,
)
from models.generic import CartItem, CartPublic
from models.message import Message

# Create a router for cart items
router = APIRouter()


@router.post("/", dependencies=[], response_model=CartPublic)
def create(
    *, db: SessionDep, cart: UserCart, create_data: CartItemCreate
) -> CartPublic:
    """
    Create new cart_item.
    """
    product_id = create_data.product_id
    quantity = create_data.quantity
    product = crud.product.get(db=db, id=product_id)
    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product doesn't exist",
        )

    cart_item = crud.cart_item.get_by_key(db=db, key="product_id", value=product_id)
    if cart_item:
        cart_item.quantity = quantity
    else:
        cart_item = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity)
        db.add(cart_item)

    db.commit()
    db.refresh(cart)

    return cart


@router.delete("/{id}", dependencies=[])
def delete(db: SessionDep, id: int) -> Message:
    """
    Delete a cart_item.
    """
    try:
        cart_item = crud.cart_item.get(db=db, id=id)
        if not cart_item:
            raise HTTPException(status_code=404, detail="Cart item not found")
        crud.cart_item.remove(db=db, id=id)
        return Message(message="Cart item deleted successfully")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        ) from e
