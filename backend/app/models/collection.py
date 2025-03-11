from sqlmodel import Field, SQLModel

from app.models.base import BaseModel


class CollectionBase(BaseModel):
    name: str = Field(index=True, unique=True)
    slug: str = Field(index=True, unique=True)
    is_active: bool = True


# Properties to receive via API on creation
class Collection(BaseModel):
    name: str = Field(..., min_length=1, description="Name is required")
    slug: str = Field(..., min_length=1, description="Slug is required")
    is_active: bool = True

class CollectionCreate(BaseModel):
    name: str = Field(..., min_length=1, description="Name is required")
    slug: str = Field(..., min_length=1, description="Slug is required")
    is_active: bool = True


# Properties to receive via API on update, all are optional
class CollectionUpdate(CollectionBase):
    pass


class CollectionPublic(CollectionBase):
    id: int
    slug: str


class Collections(SQLModel):
    collections: list[CollectionPublic]
    page: int
    limit: int
    total_count: int
    total_pages: int


class Search(SQLModel):
    results: list[CollectionPublic]
