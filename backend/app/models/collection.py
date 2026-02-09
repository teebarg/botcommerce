from app.models.base import BM
from pydantic import BaseModel, Field
from datetime import datetime
from app.models.product import SearchProduct


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


class SharedCollectionBase(BM):
    title: str = Field(..., min_length=1, description="Title is required")
    description: str | None = None
    is_active: bool = True

class SharedCollection(SharedCollectionBase):
    id: int
    slug: str = Field(..., min_length=1)
    products: list[SearchProduct]
    view_count: int = 0
    products_count: int = 0

class Catalog(SharedCollectionBase):
    products: list[SearchProduct]
    view_count: int = 0
    limit: int
    next_cursor: int | None = None
    total_count: int

class SharedCollections(BaseModel):
    shared: list[SharedCollection]
    skip: int
    limit: int
    total_count: int
    total_pages: int

class SharedCollectionCreate(SharedCollectionBase):
    products: list[int] | None = None

class SharedCollectionUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    is_active: bool | None = None
    products: list[int] | None = None


class SharedCollectionBulkAdd(BaseModel):
    product_ids: list[int]

class SharedCollectionViewBase(BM):
    shared_collection_id: int
    user_id: int | None = None
    ip_address: str | None = None
    user_agent: str | None = None

class SharedCollectionView(SharedCollectionViewBase):
    id: int
    timestamp: datetime
