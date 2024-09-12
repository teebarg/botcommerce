from sqlmodel import Field, SQLModel

from models.base import BaseModel


class TagBase(BaseModel):
    name: str = Field(index=True, unique=True)
    is_active: bool = True


class TagCreate(TagBase):
    pass


class TagUpdate(TagBase):
    pass


class TagPublic(TagBase):
    id: int
    slug: str


class Tags(SQLModel):
    tags: list[TagPublic]
    page: int
    per_page: int
    total_count: int
    total_pages: int
