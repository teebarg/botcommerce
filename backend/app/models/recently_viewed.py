from pydantic import BaseModel
from typing import Optional

class RecentlyViewedProduct(BaseModel):
    id: int
    name: str
    slug: str
    image: Optional[str] = None
    price: float = 0.0
    old_price: Optional[float] = None
    variant_id: Optional[int] = None
    rating: Optional[float] = None
    review_count: Optional[int] = None

class RecentlyViewedResponse(BaseModel):
    products: list[RecentlyViewedProduct]
    