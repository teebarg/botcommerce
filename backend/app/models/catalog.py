from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.product import SearchProduct

class CatalogView(BaseModel):
    id: int
    ip_address: str | None
    user_agent: str | None

class CatalogBase(BaseModel):
    id: int
    title: str
    slug: str
    description: Optional[str]
    is_active: bool
    view_count: int
    created_at: Optional[datetime] = None

class Catalog(CatalogBase):
    products: Optional[List[SearchProduct]] = []
    view_count: int = 0
    products_count: int = 0

class CursorPaginatedCatalog(BaseModel):
    products: list[SearchProduct]
    view_count: int = 0
    limit: int
    next_cursor: int | None = None
    total_count: int

class Catalogs(BaseModel):
    catalogs: list[Catalog]
    skip: int
    limit: int
    total_count: int
    total_pages: int

class CatalogCreate(BaseModel):
    title: str = Field(..., min_length=1, description="Title is required")
    description: str | None = None
    is_active: bool = True

class CatalogUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    is_active: bool | None = None
    products: list[int] | None = None


class CatalogBulkAdd(BaseModel):
    product_ids: list[int]
