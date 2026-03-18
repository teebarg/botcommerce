from pydantic import BaseModel, Field
from typing import Optional, List

class CategoryBase(BaseModel):
    name: str
    is_active: bool = True
    image: Optional[str] = None
    display_order: int = 0


class Category(CategoryBase):
    id: int
    slug: str


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, description="Name is required")
    is_active: bool = True
    image: Optional[str] = None
    display_order: int = 0


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None

class CategoryOrderUpdate(BaseModel):
    id: int
    display_order: int


class BulkOrderUpdate(BaseModel):
    categories: list[CategoryOrderUpdate]