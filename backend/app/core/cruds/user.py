from fastapi import HTTPException
from sqlmodel import Session, select

from app.core import crud
from app.core.cruds.base import BaseCRUD
from app.core.security import get_password_hash
from app.models.wishlist import Wishlist
from app.models.user import User, UserCreate, UserUpdate
from app.models.wishlist import WishlistCreate


class UserCRUD(BaseCRUD[User, UserCreate, UserUpdate]):
    def create(self, db: Session, user_create: UserCreate) -> User:
        db_obj = User.model_validate(
            user_create,
            update={"hashed_password": get_password_hash(user_create.password)},
        )
        return self.sync(db=db, update=db_obj)

    async def get_by_email(self, *, db: Session, email: str) -> User | None:
        statement = select(User).where(User.email == email)
        return db.exec(statement).first()


    def get_user_wishlist(self, db: Session, user_id: int) -> list[Wishlist]:
        statement = select(Wishlist).where(Wishlist.user_id == user_id)
        return db.exec(statement).all()

    def create_wishlist_item(self, db: Session, item: WishlistCreate, user_id: int):
        ws_exist = db.exec(
            select(Wishlist)
            .where(Wishlist.user_id == user_id)
            .where(Wishlist.product_id == item.product_id)
        ).first()
        if ws_exist:
            raise HTTPException(
                status_code=422,
                detail="Product already exists in wishlist",
            )

        db_prod = crud.product.get(db=db, id=item.product_id)

        if not db_prod:
            raise HTTPException(
                status_code=400,
                detail="Product doesn't exists in the system.",
            )

        db_item = Wishlist(
            **db_prod.model_dump(), product_id=db_prod.id, user_id=user_id
        )
        return self.sync(db=db, update=db_item)
