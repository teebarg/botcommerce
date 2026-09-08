from typing import Any, Literal, Optional

from pydantic import BaseModel


class UserInteractionCreate(BaseModel):
    product_id: int
    type: Literal["VIEW", "PURCHASE", "CART_ADD"]
    metadata: Optional[dict[str, Any]] = None
