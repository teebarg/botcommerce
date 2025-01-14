from typing import Any

from sqlalchemy.orm import Session
from sqlmodel import or_, select

from app.core.logging import logger
from app.core.utils import generate_slug
from app.models.collection import CollectionCreate, CollectionUpdate
from app.models.generic import Collection


def build_query(queries: dict) -> list:
    filters = []
    for key, value in queries.items():
        if value:
            column = getattr(Collection, key)
            filters.append(column.like(f"%{value}%"))
    return filters

def get_multi(
    db: Session,
    filters: list,
    limit: int = 20,
    offset: int = 0,
    sort: str = "desc",
) -> list[Collection]:
    statement = select(Collection)
    if filters:
        statement = statement.where(or_(*filters))
    if sort == "desc":
        statement = statement.order_by(Collection.created_at.desc())
    return db.exec(statement.offset(offset).limit(limit))

def all(db: Session) -> Collection | None:
    return db.query(Collection).all()

def get(db: Session, id: str) -> Collection | None:
    return db.get(Collection, id)

def get_by_key(
    db: Session, value: str | int, key: str = "name"
) -> Collection | None:
    statement = select(Collection).where(getattr(Collection, key) == value)
    return db.exec(statement).first()

def create(db: Session, obj_in: CollectionCreate) -> Collection:
    db_obj = Collection.model_validate(obj_in, update={"slug": generate_slug(name=obj_in.name)},)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update(db: Session, db_obj: Collection, obj_in: CollectionUpdate) -> Collection:
    update_data = obj_in.model_dump(exclude_unset=True)
    db_obj.sqlmodel_update(update_data)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def remove(db: Session, id: int) -> Collection:
    db_obj = db.get(Collection, id)
    db.delete(db_obj)
    db.commit()
    return db_obj


async def bulk_upload(db: Session, records: list[dict[str, Any]]) -> None:
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

