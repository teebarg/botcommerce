from typing import Any, Dict

from sqlmodel import Session, select

from core.logging import logger
from core.utils import generate_slug
from crud.base import CRUDBase
from models.generic import Tag
from models.tag import TagCreate, TagUpdate


class CRUDTag(CRUDBase[Tag, TagCreate, TagUpdate]):
    def create(self, db: Session, obj_in: TagCreate) -> Tag:
        db_obj = Tag.model_validate(
            obj_in,
            update={"slug": generate_slug(name=obj_in.name)},
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    async def bulk_upload(self, db: Session, *, records: list[Dict[str, Any]]) -> None:
        for tag in records:
            try:
                if model := db.exec(
                    select(Tag).where(Tag.slug == tag.get("slug"))
                ).first():
                    model.sqlmodel_update(tag)
                else:
                    model = Tag(**tag)
                    db.add(model)
                db.commit()
            except Exception as e:
                logger.error(e)


tag = CRUDTag(Tag)
