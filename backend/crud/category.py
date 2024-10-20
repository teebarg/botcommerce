from sqlmodel import Session

from core.utils import generate_slug
from crud.base import CRUDBase
from models.category import CategoryCreate, CategoryUpdate
from models.generic import Category


class CRUDCategory(CRUDBase[Category, CategoryCreate, CategoryUpdate]):
    def create(self, db: Session, obj_in: CategoryCreate) -> Category:
        db_obj = Category.model_validate(
            obj_in,
            update={"slug": generate_slug(name=obj_in.name)},
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


category = CRUDCategory(Category)
