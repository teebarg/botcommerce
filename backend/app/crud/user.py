from typing import  List

from app.services.cache import get_cache_service
from fastapi import HTTPException
from sqlmodel import Session, select

from app import crud
from app.core.security import get_password_hash
from app.crud.base import CRUDBase
from app.models.generic import User, Wishlist
from app.models.user import UserCreate, UserUpdate
from app.models.wishlist import WishlistCreate
import json


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

    async def get_by_email(self, *, db: Session, email: str) -> User | None:
        # Try to get user from Redis cache first
        cache_service = await get_cache_service()
        cache_key = f"user:email:{email}"
        cached_user = cache_service.get(cache_key)
        
        if cached_user:
            user_data = json.loads(cached_user)
            return User(**user_data)
        
        # If not in cache, query the database
        statement = select(User).where(User.email == email)
        user = db.exec(statement).first()
        
        # Cache the result if user exists
        if user:
            cache_service.set(
                cache_key,
                user.model_dump_json()
            )
        
        return user

    def get_user_wishlist(self, db: Session, user_id: int) -> List[Wishlist]:
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
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        return db_item


user = CRUDUser(User)
