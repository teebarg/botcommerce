from app.models.product import Product
from pydantic import BaseModel, Field
from typing import List, Optional

class ProductImageResponse(BaseModel):
    id: int
    product_id: Optional[int] = None
    image: str
    order: int

    class Config:
        from_attributes = True

class BulkUploadSchema(BaseModel):
    images: List[str] = Field(..., description="List of unlinked hosted image URLs")

class BulkDeleteSchema(BaseModel):
    image_ids: List[int]

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

# class PaginatedProductImages(BaseModel):
#     items: List[Any]
#     next_cursor: Optional[int]
#     limit: int

class ProductImageCreateSchema(BaseModel):
    product_id: int
    image_url: str
    order: int = 0

class MetadataUpdateSchema(BaseModel):
    order: Optional[int] = None
    image_url: Optional[str] = None
