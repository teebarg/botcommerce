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
