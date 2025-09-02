from pydantic import BaseModel
from typing import Optional, Literal, Any
from datetime import datetime

class UserInteractionCreate(BaseModel):
    user_id: int
    product_id: int
    type: Literal["VIEW", "PURCHASE", "CART_ADD"]
    metadata: Optional[dict[str, Any]] = None

class UserInteractionResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    type: Literal["VIEW", "PURCHASE", "CART_ADD"]
    timestamp: datetime
    metadata: Optional[dict[str, Any]] = None