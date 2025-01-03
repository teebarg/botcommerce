from sqlmodel import Session

from app.core.utils import generate_slug
from app.crud.base import CRUDBase
from app.models.brand import BrandCreate, BrandUpdate
from app.models.generic import Brand


class CRUDBrand(CRUDBase[Brand, BrandCreate, BrandUpdate]):
    def create(self, db: Session, obj_in: BrandCreate) -> Brand:
        db_obj = Brand.model_validate(
            obj_in,
            update={"slug": generate_slug(name=obj_in.name)},
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


brand = CRUDBrand(Brand)
