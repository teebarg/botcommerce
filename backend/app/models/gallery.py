from typing import List, Optional

from pydantic import BaseModel

from app.models.product import Product


class ProductImage(BaseModel):
    id: int
    image: Optional[str] = None
    order: int
    product_id: Optional[int] = None
    product: Optional[Product] = None

    class Config:
        from_attributes = True

class ImageLite(BaseModel):
    id: int
    image: Optional[str] = None
    order: int

class GalleryImage(BaseModel):
    id: int
    image: Optional[str] = None
    images: Optional[List[ImageLite]] = []
    order: int
    product_id: Optional[int] = None
    product: Optional[Product] = None

    class Config:
        from_attributes = True

class PaginatedGalleryImages(BaseModel):
    items: list[GalleryImage]
    next_cursor: int | None
    limit: int
