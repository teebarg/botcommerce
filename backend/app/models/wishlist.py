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
    page: int
    limit: int
    total_count: int
    total_pages: int


class Search(BaseModel):
    results: list[Wishlist]
