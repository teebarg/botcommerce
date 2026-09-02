from datetime import datetime
from typing import Any, Optional

from prisma.enums import ShippingMethod
from pydantic import BaseModel, ConfigDict

from app.lib.validation import PhoneNumber


class UserModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    first_name: str
    last_name: str
    phone: str | None = None
    email: str | None = None


class ProductVariantModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sku: str
    price: float
    old_price: Optional[float] = 0.0
    inventory: int
    age: Optional[str] = None
    size: Optional[str] = None
    color: Optional[str] = None
    width: Optional[int] = None
    length: Optional[int] = None

class CartAddress(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = None
    first_name: str
    last_name: str
    address_type: Optional[str]
    label: Optional[str] = None
    address_1: str
    address_2: Optional[str] = None
    state: Optional[str] = None
    phone: PhoneNumber = None


class CartItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    variant_id: int
    name: str | None = None
    slug: str | None = None
    image: str | None = None
    price: float
    quantity: int
    variant: ProductVariantModel | None = None


class CartResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cart_number: str
    user_id: Optional[int] = None
    user: Optional[UserModel] = None
    status: str
    email: Optional[str] = None
    phone: Optional[str] = None
    total: float
    subtotal: float
    tax: float
    wallet_used: float
    shipping_method: Optional[ShippingMethod] = None
    shipping_fee: float
    shipping_address_id: Optional[int] = None
    shipping_address: Optional[CartAddress]
    discount_amount: float
    coupon_code: Optional[str] = None
    coupon_id: Optional[int]
    items: list[CartItemResponse] = []
    created_at: datetime


class CartListResponse(BaseModel):
    items: list[CartResponse]
    total: int
    skip: int
    limit: int
    has_more: bool
