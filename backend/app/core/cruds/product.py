from typing import Any

from sqlmodel import Session, select

from app.core import crud
from app.core.cruds.base import BaseCRUD
from app.core.logging import logger
from app.core.utils import generate_slug
from app.models.product import (
    ProductCreate,
    ProductUpdate,
    Product
)
from app.models.brand import Brand
from app.models.reviews import Review


class ProductCRUD(BaseCRUD[Product, ProductCreate, ProductUpdate]):
    def reviews(self, db: Session, product_id: int) -> list[Review]:
        return db.query(Review).filter(Review.product_id == product_id).order_by(Review.created_at.desc()).all()

    def create(self, db: Session, obj_in: ProductCreate) -> Product:
        db_obj = Product.model_validate(
            obj_in,
            update={
                "slug": generate_slug(name=obj_in.name),
                "tags": self.get_tag_update(db=db, update=obj_in),
                "brands": self.get_brands_update(db=db, update=obj_in),
                "categories": self.get_categories_update(db=db, update=obj_in),
                "collections": self.get_collection_update(db=db, update=obj_in),
            },
        )
        return self.sync(db=db, update=db_obj)

    def update(
        self,
        db: Session,
        *,
        db_obj: Product,
        obj_in: Any,
    ) -> Product:
        try:
            if isinstance(obj_in, dict):
                update_data = obj_in
            else:
                update_data = obj_in.dict(exclude_unset=True)
            db_obj.sqlmodel_update(update_data)
            # if "name" in update_data:
            # #     db_obj.slug = generate_slug(name=update_data.get("name", ""))
            # if "tags" in update_data:
            #     db_obj.tags = self.get_tag_update(db=db, update=obj_in)
            # if "brands" in update_data:
            #     db_obj.brands = self.get_brands_update(db=db, update=obj_in)
            # if "categories" in update_data:
            #     db_obj.categories = self.get_categories_update(db=db, update=obj_in)
            # if "collections" in update_data:
            #     db_obj.collections = self.get_collection_update(db=db, update=obj_in)

            return self.sync(db=db, update=db_obj, type="update")
        except Exception as e:
            raise e

    async def bulk_upload(self, db: Session, *, records: list[dict[str, Any]]) -> None:
        for product in records:
            try:
                if model := db.exec(
                    select(Product).where(Product.slug == product.get("slug"))
                ).first():
                    model.sqlmodel_update(product)
                else:
                    model = Product(**product)
                    db.add(model)
                db.commit()
            except Exception as e:
                logger.error(e)
