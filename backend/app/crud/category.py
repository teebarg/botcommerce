from sqlmodel import Session

from app.core.utils import generate_slug
from app.crud.base import CRUDBase
from app.models.category import CategoryCreate, CategoryUpdate
from app.models.generic import Category


class CRUDCategory(CRUDBase[Category, CategoryCreate, CategoryUpdate]):
    # def create(self, db, obj_in: CategoryCreate) -> Category:
    #     db_obj = Category.model_validate(
    #         obj_in,
    #         update={"slug": generate_slug(name=obj_in.name)},
    #     )

    #     response = (
    #         db.table(self._table_name())
    #         .insert(db_obj.model_dump(mode="json", exclude_unset=True))
    #         .execute()
    #     )

    #     return response.data[0]

    # def update(
    #     self,
    #     db,
    #     *,
    #     obj_in: Union[CategoryUpdate, Dict[str, Any]],
    #     id: str
    # ) -> Category:
    #     if isinstance(obj_in, dict):
    #         update_data = obj_in
    #     else:
    #         update_data = obj_in.model_dump(exclude_unset=True)

    #     update_data.update({"slug": generate_slug(name=update_data.get("name", ""))})

    #     response = (
    #         db.table(self._table_name())
    #         .update(update_data)
    #         .eq("id", id)
    #         .execute()
    #     )
    #     return response.data[0]

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
