from typing import Any, Dict

from sqlmodel import Session, select

from core.logging import logger
from core.security import get_password_hash
from crud.base import CRUDBase
from models.generic import User
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

    def is_active(self, user: User) -> bool:
        return user.is_active

    def is_superuser(self, user: User) -> bool:
        return user.is_superuser

    def update_or_create_user(
        self,
        *,
        db: Session,
        obj_in: Dict[str, Any],
    ) -> User:
        try:
            if model := db.exec(
                select(User).where(User.email == obj_in.get("email"))
            ).first():
                model.sqlmodel_update(obj_in)
            else:
                # If the record doesn't exist, create a new record
                model = User(**obj_in)
                db.add(model)

            db.commit()
            db.refresh(model)
            return model
        except Exception as e:
            logger.error(f"Error creating or updating user {e}")
            raise Exception(e) from e


user = CRUDUser(User)
