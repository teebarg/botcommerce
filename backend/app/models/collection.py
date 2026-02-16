from app.models.base import BM
from pydantic import BaseModel, Field


class CollectionBase(BM):
    name: str = Field(..., min_length=1, description="Name is required")
    is_active: bool = True

class Collection(CollectionBase):
    id: int
    slug: str = Field(..., min_length=1)


class CollectionCreate(CollectionBase):
    pass


class CollectionUpdate(CollectionBase):
    pass


class Collections(BaseModel):
    collections: list[Collection]
    skip: int
    limit: int
    total_count: int
    total_pages: int


class Search(BaseModel):
    results: list[Collection]
