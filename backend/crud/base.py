from datetime import datetime, timezone
from typing import Any, Dict, Generic, Optional, Type, TypeVar, Union

from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlmodel import or_, select

from core.utils import generate_slug

ModelType = TypeVar("ModelType", bound=Any)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=Any)


class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        """
        CRUD object with default methods to Create, Read, Update, Delete (CRUD).

        **Parameters**

        * `model`: A SQLAlchemy model class
        * `schema`: A Pydantic model (schema) class
        """
        self.model = model

    def build_query(
        self,
        queries: dict,
    ) -> list:
        filters = []
        for key, value in queries.items():
            if value:
                column = getattr(self.model, key)
                filters.append(column.like(f"%{value}%"))
        return filters

    def get_multi(
        self,
        db: Session,
        filters: list,
        per_page: int = 20,
        offset: int = 1,
        sort: str = "desc",
    ) -> list[ModelType]:
        statement = select(self.model)
        if filters:
            statement = statement.where(or_(*filters))
        if sort == "desc":
            statement = statement.order_by(self.model.created_at.desc())
        return db.exec(statement.offset(offset).limit(per_page))

    def all(self, db: Session) -> list[ModelType]:
        return db.query(self.model)

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        return db.get(self.model, id)

    def get_by_key(
        self, *, db: Session, key: str = "name", value: str | int
    ) -> ModelType | None:
        statement = select(self.model).where(getattr(self.model, key) == value)
        return db.exec(statement).first()

    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data)  # type: ignore
        return self.sync(db=db, update=db_obj)

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]],
    ) -> ModelType:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        update_data.update({"slug": generate_slug(name=update_data.get("name", ""))})
        db_obj.sqlmodel_update(update_data)
        return self.sync(db=db, update=db_obj, type="update")

    def update_or_create(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]],
        column_name: str,
        column_value: str,
        model_type: Type[ModelType],
    ) -> ModelType:
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])

        if model := db.exec(
            select(db_obj).where(getattr(db_obj, column_name) == column_value)
        ).first():
            # If the record exists, update the existing record
            for key, value in update_data.items():
                setattr(model, key, value)
        else:
            # If the record doesn't exist, create a new record
            update_data[column_name] = column_value
            model = model_type(**update_data)
            db.add(model)

        db.commit()
        db.refresh(model)
        return model

    def remove(self, db: Session, *, id: int) -> ModelType:
        db_obj = db.get(self.model, id)
        db.delete(db_obj)
        db.commit()
        return db_obj

    def sync(self, db: Session, update: ModelType, type: str = "create") -> ModelType:
        update.updated_at = datetime.now(timezone.utc)
        if type == "create":
            update.created_at = datetime.now(timezone.utc)
        db.add(update)
        db.commit()
        db.refresh(update)
        return update
