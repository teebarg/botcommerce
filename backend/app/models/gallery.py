from app.models.product import Product
from pydantic import BaseModel
from typing import Optional

class ProductImage(BaseModel):
    id: int
    image: Optional[str] = None
    order: int
    product_id: Optional[int] = None
    product: Optional[Product] = None

class PaginatedProductImages(BaseModel):
    items: list[ProductImage]
    next_cursor: int | None
    limit: int
