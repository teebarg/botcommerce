from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from prisma.enums import CartStatus

class CartItemSchema(BaseModel):
    id: int
    name: str
    quantity: int
    price: float
    image: Optional[str] = None

    class Config:
        from_attributes = True  # Allows parsing Prisma items

class UserSchema(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str

    class Config:
        from_attributes = True

class AbandonedCartSchema(BaseModel):
    id: int
    user: Optional[UserSchema]
    email: Optional[str]
    cart_number: str
    status: Optional[CartStatus]
    items: Optional[list[CartItemSchema]] = []
    total: float = 0
    subtotal: float = 0
    tax: float = 0
    shipping_fee: float = 0
    created_at: datetime

    class Config:
        from_attributes = True

class PaginatedAbandonedCarts(BaseModel):
    items: List[AbandonedCartSchema]
    next_cursor: Optional[int] = None
    limit: int