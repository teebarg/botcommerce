from app.models.product import ProductLite
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProductImage(BaseModel):
    id: int
    image: Optional[str] = None
    order: int
    product_id: Optional[int] = None
    product: Optional[ProductLite] = None
    created_at: datetime

class PaginatedProductImages(BaseModel):
    items: list[ProductImage]
    next_cursor: int | None
    limit: int
