from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

import crud
from core.deps import (
    SessionDep,
    UserCart,
    get_current_user,
)
from models.generic import CartPublic
from models.message import Message

# Create a router for carts
router = APIRouter()


@router.get(
    "/",
    response_model=CartPublic,
)
def index(
    cart: UserCart,
) -> CartPublic:
    """
    Retrieve cart.
    """
    return cart


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
