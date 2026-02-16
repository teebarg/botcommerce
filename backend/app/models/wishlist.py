from typing import Optional
from pydantic import BaseModel
from app.models.product import ProductLite


class Wishlist(BaseModel):
    id: int
    product: Optional[ProductLite] = None

class WishlistCreate(BaseModel):
    product_id: int

class Wishlists(BaseModel):
    wishlists: list[Wishlist]
