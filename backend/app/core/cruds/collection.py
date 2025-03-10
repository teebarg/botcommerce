from app.core.utils import generate_slug
from sqlmodel import Session

from app.core.cruds.base import BaseCRUD
from app.models.collection import CollectionCreate, CollectionUpdate
from app.models.generic import Collection


class CollectionCRUD(BaseCRUD[Collection, CollectionCreate, CollectionUpdate]):
    def create(self, db: Session, obj_in: CollectionCreate) -> Collection:
        db_obj = Collection.model_validate(
            obj_in,
            update={"slug": generate_slug(name=obj_in.name)},
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    # def update(self, db: Session, db_obj: Collection, obj_in: CollectionUpdate) -> Collection:
    #     # Custom update logic for the Collection model
    #     update_data = obj_in.dict(exclude_unset=True) if hasattr(obj_in, "dict") else obj_in

    #     # Example of custom behavior:
    #     if "special_field" in update_data:
    #         update_data["special_field"] = self.custom_logic(update_data["special_field"])

    #     for field, value in update_data.items():
    #         setattr(db_obj, field, value)

    #     db.add(db_obj)
    #     db.commit()
    #     db.refresh(db_obj)
    #     return db_obj

    # @staticmethod
    # def custom_logic(value):
    #     # Example of custom logic for a field
    #     return value.upper()
