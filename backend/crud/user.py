from typing import List
from models.wishlist import WishlistCreate
from sqlmodel import Session, select

from core.security import get_password_hash
from crud.base import CRUDBase
from models.generic import User, Wishlist
from models.user import UserCreate, UserUpdate


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def create(self, db: Session, user_create: UserCreate) -> User:
        db_obj = User.model_validate(
            user_create,
            update={"hashed_password": get_password_hash(user_create.password)},
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_email(self, *, db: Session, email: str) -> User | None:
        statement = select(User).where(User.email == email)
        return db.exec(statement).first()
    
    def get_user_wishlist(self, user_id: int) -> List[Wishlist]:
        return (
            self.query(Wishlist)
            .filter(Wishlist.user_id == user_id)
            .all()
        )

    def create_wishlist_item(self, item: WishlistCreate, user_id: int):
        db_item = Wishlist(**item.dict(), user_id=user_id)
        self.add(db_item)
        self.commit()
        self.refresh(db_item)
        return db_item


user = CRUDUser(User)
