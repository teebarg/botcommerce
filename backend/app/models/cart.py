from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum
from prisma.models import ProductVariant

# Enums
class CartStatus(str, Enum):
    ACTIVE = "ACTIVE"
    ABANDONED = "ABANDONED"
    CONVERTED = "CONVERTED"

# Pydantic models for request/response validation
class CartItemBase(BaseModel):
    variant_id: int
    quantity: int
    price: float
    image: Optional[str] = None

class CartItemCreate(BaseModel):
    variant_id: int
    quantity: int

class CartItemResponse(CartItemBase):
    id: int
    cart_id: int
    variant: ProductVariant
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CartCreate(BaseModel):
    cart_number: str
    status: Optional[CartStatus] = CartStatus.ACTIVE

class CartUpdate(BaseModel):
    status: Optional[CartStatus] = None

class CartDetails(BaseModel):
    shipping_address: dict | None = None
    billing_address: dict | None = None
    email: str | None = None
    shipping_method: dict | None = None
    payment_session: dict | None = None

class CartResponse(BaseModel):
    id: int
    user_id: int | None = None
    cart_number: str
    status: CartStatus
    items: List[CartItemResponse]
    created_at: datetime
    last_updated: datetime


class CartItemIn(BaseModel):
    product_id: str
    quantity: int


class CartDetails(BaseModel):
    shipping_address: dict | None = None
    billing_address: dict | None = None
    email: str | None = None
    shipping_method: dict | None = None
    payment_session: dict | None = None
