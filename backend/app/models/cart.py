from pydantic import BaseModel
from enum import Enum
from prisma.enums import PaymentMethod, ShippingMethod
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from enum import Enum
from app.models.user import User
from app.models.product import ProductVariant

class CartStatus(str, Enum):
    ACTIVE = "ACTIVE"
    ABANDONED = "ABANDONED"
    CONVERTED = "CONVERTED"

class CartAddress(BaseModel):
    id: Optional[int]
    first_name: str
    last_name: str
    address_type: Optional[str]
    label: Optional[str]
    address_1: str
    address_2: Optional[str]
    city: Optional[str]
    state: Optional[str]
    phone: Optional[str]
    is_billing: bool

class CartItemCreate(BaseModel):
    variant_id: int
    quantity: int


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


class CartItemBase(BaseModel):
    variant_id: int
    quantity: int
    price: float
    name: Optional[str]
    slug: Optional[str]
    image: Optional[str]

class CartItemResponse(CartItemBase):
    id: int
    cart_id: int
    cart_number: str
    variant: Optional[ProductVariant]
    created_at: datetime
    updated_at: datetime

class CartResponse(BaseModel):
    id: int
    user_id: Optional[int]
    user: Optional[User]
    cart_number: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    status: Optional[CartStatus]
    items: Optional[list[CartItemResponse]] = []
    payment_method: Optional[PaymentMethod]
    shipping_method: Optional[ShippingMethod]
    shipping_address_id: Optional[int] = None
    shipping_address: Optional[CartAddress]
    billing_address: Optional[CartAddress]
    total: float = 0
    subtotal: float = 0
    tax: float = 0
    shipping_fee: float = 0
    discount_amount: float = 0
    wallet_used: float = 0
    coupon_code: Optional[str]
    coupon_id: Optional[int]

class CartLite(BaseModel):
    id: int
    user_id: Optional[int]
    cart_number: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    status: Optional[CartStatus]
    payment_method: Optional[PaymentMethod]
    shipping_method: Optional[ShippingMethod]
    shipping_address_id: Optional[int] = None
    total: float = 0
    subtotal: float = 0
    tax: float = 0
    shipping_fee: float = 0
    discount_amount: float = 0
    wallet_used: float = 0
    coupon_code: Optional[str]
    coupon_id: Optional[int]

class PaginatedCarts(BaseModel):
    data: List[CartResponse]
    next_cursor: Optional[int]
    limit: int