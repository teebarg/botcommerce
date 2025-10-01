from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.order import OrderStatus

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    unit_price: float

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    customer_id: int
    shipping_address_id: int
    billing_address_id: int
    items: List[OrderItemCreate]
    subtotal: float
    shipping_cost: float
    tax: float
    total: float
    notes: Optional[str] = None

class OrderResponse(OrderBase):
    id: int
    order_number: str
    status: OrderStatus
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse]
    customer: dict
    shipping_address: dict
    billing_address: dict

    class Config:
        from_attributes = True

class OrderFilterParams(BaseModel):
    status: Optional[OrderStatus] = None
    search: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    customer_id: Optional[int] = None