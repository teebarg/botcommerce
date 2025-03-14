from app.models.base import BM
from pydantic import BaseModel


class WishlistBase(BM):
    product_id: int

class Wishlist(WishlistBase):
    id: int


class WishlistCreate(WishlistBase):
    pass


class WishlistUpdate(WishlistBase):
    pass


class Wishlists(BaseModel):
    wishlists: list[Wishlist]


class Search(BaseModel):
    results: list[Wishlist]
