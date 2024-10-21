from typing import Optional

from pydantic import BaseModel as BM

from models.base import BaseModel


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
    categories: list[int] = []
    collections: list[int] = []
    tags: list[int] = []


# Properties to receive via API on update, all are optional
class ProductUpdate(ProductBase):
    categories: list[int] = []
    collections: list[int] = []
    tags: list[int] = []


class ProductSearch(BM):
    query: Optional[str] = ""
    categories: Optional[str] = ""
    collections: Optional[str] = ""
    min_price: Optional[int] = 0
    max_price: Optional[int] = 100
    page: Optional[int] = 1
    limit: Optional[int] = 20
    sort: Optional[str] = "created_at:desc"
