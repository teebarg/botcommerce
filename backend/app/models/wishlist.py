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

class Wishlist(WishlistBase, table=True):
    __tablename__ = "wishlists"
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", nullable=False, ondelete="CASCADE")
    product_id: int = Field(
        foreign_key="product.id", nullable=False, ondelete="CASCADE"
    )


class Wishlists(SQLModel):
    wishlists: list[Wishlist]
