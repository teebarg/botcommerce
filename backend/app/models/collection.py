from typing import Optional
from pydantic import BaseModel, Field


class Collection(BaseModel):
    id: int
    name: str
    slug: str
    is_active: bool = True


class CollectionCreate(BaseModel):
    name: str = Field(..., min_length=1, description="Name is required")
    is_active: bool = True


class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None


class Collections(BaseModel):
    collections: list[Collection]
    skip: int
    limit: int
    total_count: int
    total_pages: int
