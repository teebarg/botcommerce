from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

from prisma.models import Address, Payment, OrderItem, User
from prisma.enums import PaymentMethod, ShippingMethod, OrderStatus, PaymentStatus

class OrderItemCreate(BaseModel):
    variant_id: int
    quantity: int
    price: float

class OrderCreate(BaseModel):
    status: Optional[OrderStatus] = OrderStatus.PENDING
    payment_status: Optional[PaymentStatus] = PaymentStatus.PENDING
    coupon_id: Optional[int] = None

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None
    shipping_method: Optional[ShippingMethod] = None
    shipping_fee: Optional[float] = None


class OrderResponse(BaseModel):
    id: int
    email: Optional[EmailStr] = None
    order_number: str
    user_id: int
    user: Optional[User]
    billing_address: Optional[Address]
    shipping_address: Optional[Address]
    total: float
    subtotal: float
    tax: float
    status: OrderStatus
    payment_status: PaymentStatus
    shipping_method: ShippingMethod
    payment: Optional[Payment]
    payment_method: PaymentMethod
    shipping_fee: float
    coupon_id: Optional[int]
    cart_id: Optional[int]
    order_items: Optional[list[OrderItem]]
    created_at: datetime
    updated_at: datetime
    order_notes: Optional[str] = None
    invoice_url: Optional[str] = None

class Order(BaseModel):
    id: int
    email: Optional[EmailStr] = None
    order_number: str
    user_id: int
    user: User
    billing_address: Optional[Address]
    shipping_address: Optional[Address]
    total: float
    subtotal: float
    tax: float
    status: OrderStatus
    payment_status: PaymentStatus
    shipping_method: ShippingMethod
    payment: Optional[Payment]
    payment_method: PaymentMethod
    shipping_fee: float
    coupon_id: Optional[int]
    cart_id: Optional[int]
    order_items: list[OrderItem]
    created_at: datetime
    updated_at: datetime
    order_notes: Optional[str] = None
    invoice_url: Optional[str] = None

class Orders(BaseModel):
    orders: list[Order]
    page: int
    limit: int
    total_count: int
    total_pages: int
