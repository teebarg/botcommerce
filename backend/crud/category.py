from typing import Any, Dict

from sqlmodel import Session, select

from core.logging import logger
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

    async def bulk_upload(self, db: Session, *, records: list[Dict[str, Any]]) -> None:
        for category in records:
            try:
                if model := db.exec(
                    select(Category).where(Category.name == category.get("slug"))
                ).first():
                    model.sqlmodel_update(category)
                else:
                    model = Category(**category)
                    db.add(model)
                db.commit()
            except Exception as e:
                logger.error(e)


category = CRUDCategory(Category)
