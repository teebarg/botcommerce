from sqlmodel import Field, SQLModel

from app.models.base import BaseModel


class WishlistBase(BaseModel):
    name: str = Field(index=True)
    description: str | None = ""
    image: str | None = ""


# Properties to receive via API on creation
class WishlistCreate(SQLModel):
    product_id: int


# Properties to return via API, id is always required
class WishlistPublic(WishlistBase):
    id: int


class Wishlists(SQLModel):
    wishlists: list[WishlistPublic]
    page: int
    limit: int
    total_count: int
    total_pages: int
