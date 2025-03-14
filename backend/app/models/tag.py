from app.models.base import BM
from pydantic import BaseModel, Field


class TagBase(BM):
    name: str = Field(..., min_length=1, description="Name is required")
    is_active: bool = True

class Tag(TagBase):
    id: int
    slug: str = Field(..., min_length=1)


class TagCreate(TagBase):
    pass


class TagUpdate(TagBase):
    pass


class Tags(BaseModel):
    tags: list[Tag]
    page: int
    limit: int
    total_count: int
    total_pages: int


class Search(BaseModel):
    results: list[Tag]
