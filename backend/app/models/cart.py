from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from enum import Enum
from prisma.models import ProductVariant, Address
from prisma.enums import PaymentMethod, ShippingMethod

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

class CartResponse(BaseModel):
    id: int
    user_id: int | None = None
    cart_number: str
    email: Optional[str] = None
    status: CartStatus
    items: List[CartItemResponse]
    payment_method: Optional[PaymentMethod] = None
    shipping_method: Optional[ShippingMethod] = None
    shipping_address: Optional[Address] = None
    billing_address: Optional[Address] = None
    total: Optional[float] = 0
    subtotal: Optional[float] = 0
    tax: Optional[float] = 0
    shipping_fee: Optional[float] = 0
    created_at: datetime
    updated_at: Optional[datetime] = None


class CartItemIn(BaseModel):
    product_id: str
    quantity: int


class CartAddress(BaseModel):
    first_name: str
    last_name: str
    address_1: str
    address_2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    phone: Optional[str] = None
    is_billing: bool


class CartUpdate(BaseModel):
    total: Optional[float] = None
    subtotal: Optional[float] = None
    tax: Optional[float] = None
    shipping_fee: Optional[float] = None
    shipping_address: Optional[CartAddress] = None
    billing_address: Optional[CartAddress] = None
    email: Optional[str] = None
    shipping_method: Optional[ShippingMethod] = None
    payment_method: Optional[PaymentMethod] = None
    status: Optional[CartStatus] = None
