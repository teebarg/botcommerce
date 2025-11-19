from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
from prisma.models import ProductVariant, Address
from prisma.enums import PaymentMethod, ShippingMethod, AddressType

# Enums
class CartStatus(str, Enum):
    ACTIVE = "ACTIVE"
    ABANDONED = "ABANDONED"
    CONVERTED = "CONVERTED"

class CartItemBase(BaseModel):
    slug: Optional[str] = None
    name: Optional[str] = None
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
    cart_number: str
    variant: ProductVariant
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CartResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    cart_number: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[CartStatus] = None
    items: Optional[list[CartItemResponse]] = []
    payment_method: Optional[PaymentMethod] = None
    shipping_method: Optional[ShippingMethod] = None
    shipping_address_id: Optional[int] = None
    shipping_address: Optional[Address] = None
    billing_address: Optional[Address] = None
    total: Optional[float] = 0
    subtotal: Optional[float] = 0
    tax: Optional[float] = 0
    shipping_fee: Optional[float] = 0
    discount_amount: Optional[float] = 0
    coupon_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class CartAddress(BaseModel):
    id: Optional[int] = None
    first_name: str
    last_name: str
    address_type: AddressType | None = Field(default=None, max_length=255)
    label: str | None = Field(default=None, max_length=255)
    address_1: str
    address_2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
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
    phone: Optional[str] = None
    shipping_method: Optional[ShippingMethod] = None
    payment_method: Optional[PaymentMethod] = None
    status: Optional[CartStatus] = None
