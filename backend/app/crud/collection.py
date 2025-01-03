from typing import Any, Dict

from sqlmodel import Session, select

from app.core.logging import logger
from app.core.utils import generate_slug
from app.crud.base import CRUDBase
from app.models.collection import CollectionCreate, CollectionUpdate
from app.models.generic import Collection


class CRUDCollection(CRUDBase[Collection, CollectionCreate, CollectionUpdate]):
    def create(self, db: Session, obj_in: CollectionCreate) -> Collection:
        db_obj = Collection.model_validate(
            obj_in,
            update={"slug": generate_slug(name=obj_in.name)},
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    async def bulk_upload(self, db: Session, *, records: list[Dict[str, Any]]) -> None:
        for collection in records:
            try:
                if model := db.exec(
                    select(Collection).where(Collection.name == collection.get("slug"))
                ).first():
                    model.sqlmodel_update(collection)
                else:
                    model = Collection(**collection)
                    db.add(model)
                db.commit()
            except Exception as e:
                logger.error(e)


collection = CRUDCollection(Collection)
