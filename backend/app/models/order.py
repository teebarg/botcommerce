from app.models.product import ProductVariant
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from prisma.enums import PaymentMethod, ShippingMethod, OrderStatus, PaymentStatus
from app.models.user import User
from app.models.address import Address

class OrderItemLite(BaseModel):
    id: int
    name: Optional[str]
    variant_id: Optional[int]
    variant: Optional[ProductVariant]
    price: float
    quantity: int
    image: Optional[str]

class OrderItemCreate(BaseModel):
    variant_id: int
    quantity: int
    price: float

class OrderCreate(BaseModel):
    status: Optional[OrderStatus] = OrderStatus.PENDING
    payment_status: Optional[PaymentStatus] = PaymentStatus.PENDING
    coupon_id: Optional[int] = None

class Order(BaseModel):
    id: int
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    order_number: str
    user_id: int
    user: Optional[User]
    shipping_address: Optional[Address]
    total: float
    subtotal: float
    tax: float
    discount_amount: float = 0
    wallet_used: Optional[float] = 0
    status: OrderStatus
    payment_status: PaymentStatus
    shipping_method: ShippingMethod
    payment_method: PaymentMethod
    shipping_fee: float
    coupon_code: Optional[str] = None
    order_items: Optional[list[OrderItemLite]]
    order_notes: Optional[str] = None
    invoice_url: Optional[str] = None
    created_at: datetime

class PaginatedOrders(BaseModel):
    items: list[Order]
    next_cursor: int | None
    limit: int

class OrderTimelineEntry(BaseModel):
    id: int
    order_id: int
    from_status: Optional[OrderStatus] = None
    to_status: Optional[OrderStatus] = None
    message: Optional[str] = None
    created_at: datetime
