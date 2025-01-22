from datetime import datetime, timezone
from typing import Any, Generic, TypeVar

from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlmodel import SQLModel, or_, select

from app.core.logging import logger

# Type variables for model and input schemas
ModelType = TypeVar("ModelType", bound=SQLModel)
CreateSchemaType = TypeVar("CreateSchemaType")
UpdateSchemaType = TypeVar("UpdateSchemaType")


class BaseCRUD(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: type[ModelType]):
        self.model = model

    def build_query(self, queries: dict) -> list[Any]:
        filters = []
        for key, value in queries.items():
            if value:
                column = getattr(self.model, key)
                filters.append(column.like(f"%{value}%"))
        return filters

    def get_multi(
        self,
        db: Session,
        filters: list[Any] = None,
        limit: int = 20,
        offset: int = 0,
        sort: str = "desc",
    ) -> list[ModelType]:
        statement = select(self.model)
        if filters:
            statement = statement.where(or_(*filters))
        if sort == "desc" and hasattr(self.model, "created_at"):
            statement = statement.order_by(self.model.created_at.desc())
        return db.exec(statement.offset(offset).limit(limit)).all()

    def all(self, db: Session) -> list[ModelType]:
        return db.query(self.model).all()

    def get(self, db: Session, id: Any) -> ModelType | None:
        return db.get(self.model, id)

    def get_by_key(
        self, db: Session, value: Any, key: str = "name"
    ) -> ModelType | None:
        statement = select(self.model).where(getattr(self.model, key) == value)
        return db.exec(statement).first()

    def create(self, db: Session, obj_in: CreateSchemaType) -> ModelType:
        data = obj_in.dict() if hasattr(obj_in, "dict") else obj_in
        db_obj = self.model(**data)
        return self.sync(db=db, update=db_obj)
        # db.add(db_obj)
        # db.commit()
        # db.refresh(db_obj)
        # return db_obj

    def update(
        self, db: Session, db_obj: ModelType, obj_in: UpdateSchemaType
    ) -> ModelType:
        update_data = obj_in.dict(exclude_unset=True) if hasattr(obj_in, "dict") else obj_in
        db_obj.sqlmodel_update(update_data)
        return self.sync(db=db, update=db_obj, type="update")
        # for field, value in update_data.items():
        #     setattr(db_obj, field, value)
        # db.add(db_obj)
        # db.commit()
        # db.refresh(db_obj)
        # return db_obj

    def update_or_create(
        self,
        db: Session,
        db_obj: ModelType,
        obj_in: UpdateSchemaType | dict[str, Any],
        column_name: str,
        column_value: str,
    ) -> ModelType:
        obj_data = jsonable_encoder(db_obj)
        update_data = obj_in if isinstance(obj_in, dict) else obj_in.dict(exclude_unset=True)
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
            model = self.model(**update_data)
            db.add(model)

        db.commit()
        db.refresh(model)
        return model

    def remove(self, db: Session, id: Any) -> ModelType:
        db_obj = db.get(self.model, id)
        db.delete(db_obj)
        db.commit()
        return db_obj

    async def bulk_upload(self, db: Session, records: list[dict[str, Any]]) -> None:
        for record in records:
            try:
                existing = db.exec(
                    select(self.model).where(self.model.name == record.get("name"))
                ).first()
                if existing:
                    for key, value in record.items():
                        setattr(existing, key, value)
                else:
                    obj = self.model(**record)
                    db.add(obj)
                db.commit()
            except Exception as e:
                logger.error(f"Error uploading record: {e}")

    def sync(self, db: Session, update: ModelType, type: str = "create") -> ModelType:
        update.updated_at = datetime.now(timezone.utc)
        if type == "create":
            update.created_at = datetime.now(timezone.utc)
        db.add(update)
        db.commit()
        db.refresh(update)
        return update
