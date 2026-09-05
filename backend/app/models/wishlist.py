from typing import Optional

from pydantic import BaseModel

from app.models.product import Product


class Wishlist(BaseModel):
    id: int
    product: Optional[Product] = None

    class Config:
        from_attributes = True

class WishlistCreate(BaseModel):
    product_id: int
