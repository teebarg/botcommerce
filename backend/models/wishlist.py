from sqlmodel import Field, SQLModel

from models.base import BaseModel


class WishlistBase(BaseModel):
    name: str = Field(index=True, unique=True)
    description: str | None  = ""
    image: str | None = ""


# Properties to receive via API on creation
class WishlistCreate(WishlistBase):
    pass


# Properties to receive via API on update, all are optional
class WishlistUpdate(WishlistBase):
    pass


# Properties to return via API, id is always required
class WishlistPublic(WishlistBase):
    id: int


class Wishlists(SQLModel):
    wishlists: list[WishlistPublic]
    page: int
    limit: int
    total_count: int
    total_pages: int
