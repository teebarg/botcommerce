from app.models.base import BM
from pydantic import BaseModel, Field


class BrandBase(BM):
    name: str = Field(..., min_length=1, description="Variant name is required")
    is_active: bool = True

class Brand(BrandBase):
    id: int
    slug: str = Field(..., min_length=1)


class BrandCreate(BrandBase):
    pass


class BrandUpdate(BrandBase):
    pass


class Brands(BaseModel):
    brands: list[Brand]
    page: int
    limit: int
    total_count: int
    total_pages: int
