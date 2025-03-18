from typing import Optional
from app.models.base import BM
from pydantic import BaseModel
from prisma.models import Product


class WishlistBase(BM):
    product_id: int

class Wishlist(WishlistBase):
    id: int
    product: Optional[Product] = None


class WishlistCreate(BaseModel):
    product_id: int


class WishlistUpdate(BaseModel):
    product_id: int


class Wishlists(BaseModel):
    wishlists: list[Wishlist]


class Search(BaseModel):
    results: list[Wishlist]
