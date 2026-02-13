from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

from prisma.models import Address, Payment, OrderItem, User, Coupon
from prisma.enums import PaymentMethod, ShippingMethod, OrderStatus, PaymentStatus

class OrderItemCreate(BaseModel):
    variant_id: int
    quantity: int
    price: float

class OrderCreate(BaseModel):
    status: Optional[OrderStatus] = OrderStatus.PENDING
    payment_status: Optional[PaymentStatus] = PaymentStatus.PENDING
    coupon_id: Optional[int] = None

class OrderResponse(BaseModel):
    id: int
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    order_number: str
    user_id: int
    user: Optional[User]
    billing_address: Optional[Address]
    shipping_address: Optional[Address]
    total: float
    subtotal: float
    tax: float
    discount_amount: float
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
    phone: Optional[str] = None
    order_number: str
    user_id: int
    user: User
    billing_address: Optional[Address]
    shipping_address: Optional[Address]
    total: float
    subtotal: float
    tax: float
    discount_amount: float
    status: OrderStatus
    payment_status: PaymentStatus
    shipping_method: ShippingMethod
    payment: Optional[Payment]
    payment_method: PaymentMethod
    shipping_fee: float
    coupon_code: Optional[str] = None
    coupon_id: Optional[int]
    coupon: Optional[Coupon]
    cart_id: Optional[int]
    order_items: list[OrderItem]
    created_at: datetime
    updated_at: datetime
    order_notes: Optional[str] = None
    invoice_url: Optional[str] = None

class Orders(BaseModel):
    orders: list[Order]
    skip: int
    limit: int
    total_count: int
    total_pages: int

class OrderTimelineEntry(BaseModel):
    id: int
    order_id: int
    from_status: Optional[OrderStatus] = None
    to_status: Optional[OrderStatus] = None
    message: Optional[str] = None
    created_at: datetime
