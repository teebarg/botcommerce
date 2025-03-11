from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
from enum import Enum

# Pydantic models for request/response validation
class OrderStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELED = "CANCELED"

class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class ShippingMethod(str, Enum):
    STANDARD = "STANDARD"
    EXPRESS = "EXPRESS"
    PICKUP = "PICKUP"

class OrderItemCreate(BaseModel):
    variant_id: int
    quantity: int
    price: float

class OrderCreate(BaseModel):
    user_id: int
    shipping_address_id: int
    billing_address_id: int
    order_items: List[OrderItemCreate]
    total: float
    subtotal: float
    tax: float
    shipping_fee: float
    status: Optional[OrderStatus] = OrderStatus.PENDING
    payment_status: Optional[PaymentStatus] = PaymentStatus.PENDING
    shipping_method: Optional[ShippingMethod] = None
    coupon_id: Optional[int] = None

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None
    shipping_method: Optional[ShippingMethod] = None
    shipping_fee: Optional[float] = None


class OrderResponse(BaseModel):
    id: int
    order_number: str
    user_id: int
    shipping_address_id: int
    billing_address_id: int
    total: float
    subtotal: float
    tax: float
    status: OrderStatus
    payment_status: Optional[PaymentStatus]
    shipping_method: Optional[ShippingMethod]
    shipping_fee: float
    coupon_id: Optional[int]
    cart_id: Optional[int]
    created_at: datetime
    updated_at: datetime

