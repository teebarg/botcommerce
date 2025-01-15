
from pydantic import BaseModel as BM

from app.models.base import BaseModel


class ProductBase(BaseModel):
    name: str
    description: str | None = ""
    image: str | None = ""
    price: float
    old_price: float = 0.0
    is_active: bool = True
    ratings: float = 5.0
    inventory: int = 1


# Properties to receive via API on creation
class ProductCreate(ProductBase):
    brands: list[int] = []
    categories: list[int] = []
    collections: list[int] = []
    tags: list[int] = []


# Properties to receive via API on update, all are optional
class ProductUpdate(ProductBase):
    brands: list[int] = []
    categories: list[int] = []
    collections: list[int] = []
    tags: list[int] = []


class ProductSearch(BM):
    query: str | None = ""
    brands: str | None = ""
    categories: str | None = ""
    collections: str | None = ""
    min_price: int | None = 0
    max_price: int | None = 100
    page: int | None = 1
    limit: int | None = 20
    sort: str | None = "created_at:desc"
