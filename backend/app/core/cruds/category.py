from app.core.cruds.base import BaseCRUD
from sqlmodel import Session

from app.core.utils import generate_slug
from app.models.category import CategoryCreate, CategoryUpdate
from app.models.generic import Category


class CategoryCRUD(BaseCRUD[Category, CategoryCreate, CategoryUpdate]):
    def create(self, db: Session, obj_in: CategoryCreate) -> Category:
        db_obj = Category.model_validate(
            obj_in,
            update={"slug": generate_slug(name=obj_in.name)},
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj