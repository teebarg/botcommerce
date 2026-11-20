from typing import List

from pydantic import BaseModel, Field, field_validator

from app.models.product import ProductOption, ProductSearch

MAX_ALBUM_PRODUCTS = 100


class AlbumCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=80)
    product_ids: List[int] = Field(..., min_length=1, max_length=MAX_ALBUM_PRODUCTS)

    @field_validator("title")
    @classmethod
    def title_not_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Title is required")
        return value


class AlbumCreated(BaseModel):
    code: str
    url: str


class AlbumSummary(BaseModel):
    code: str
    title: str
    product_count: int
    url: str


class AlbumProduct(ProductSearch):
    options: List[ProductOption] = Field(default_factory=list)


class AlbumPublic(BaseModel):
    title: str
    products: List[AlbumProduct]