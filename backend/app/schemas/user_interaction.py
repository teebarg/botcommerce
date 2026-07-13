from pydantic import BaseModel
from typing import Optional, Literal, Any

class UserInteractionCreate(BaseModel):
    product_id: int
    type: Literal["VIEW", "PURCHASE", "CART_ADD"]
    metadata: Optional[dict[str, Any]] = None
