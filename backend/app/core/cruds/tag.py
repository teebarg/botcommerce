from app.core.cruds.base import BaseCRUD
from sqlmodel import Session

from app.core.utils import generate_slug
from app.models.tag import TagCreate, TagUpdate
from app.models.generic import Tag


class TagCRUD(BaseCRUD[Tag, TagCreate, TagUpdate]):
    def create(self, db: Session, obj_in: TagCreate) -> Tag:
        db_obj = Tag.model_validate(
            obj_in,
            update={"slug": generate_slug(name=obj_in.name)},
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
