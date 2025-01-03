from sqlmodel import Field, SQLModel

from app.models.base import BaseModel


class BrandBase(BaseModel):
    name: str = Field(index=True, unique=True)
    is_active: bool = True


class BrandCreate(BrandBase):
    pass


class BrandUpdate(BrandBase):
    pass


class BrandPublic(BrandBase):
    id: int
    slug: str


class Brands(SQLModel):
    brands: list[BrandPublic]
    page: int
    limit: int
    total_count: int
    total_pages: int
