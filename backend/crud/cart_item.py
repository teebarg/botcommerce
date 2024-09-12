from sqlmodel import Session

from core.utils import generate_slug
from crud.base import CRUDBase
from models.cart_item import CartItemCreate, CartItemUpdate
from models.generic import CartItem


class CRUDCartItem(CRUDBase[CartItem, CartItemCreate, CartItemUpdate]):
    def create(self, db: Session, obj_in: CartItemCreate) -> CartItem:
        db_obj = CartItem.model_validate(
            obj_in,
            update={"slug": generate_slug(name=obj_in.session_id)},
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


cart_item = CRUDCartItem(CartItem)
