from app.models.base import BM
from pydantic import BaseModel, Field
from typing import Optional


class CategoryBase(BM):
    name: str = Field(..., min_length=1, description="Name is required")
    is_active: bool = True


class Category(CategoryBase):
    id: int
    slug: str = Field(..., min_length=1)
    parent: Optional[list["Category"]] = None
    parent_id: Optional[int] = None
    subcategories: Optional[list["Category"]] = None


class CategoryCreate(CategoryBase):
    parent_id: int = None


class CategoryUpdate(CategoryBase):
    pass


class Categories(BaseModel):
    categories: list[Category]
    page: int
    limit: int
    total_count: int
    total_pages: int


class Search(BaseModel):
    results: list[Category]
