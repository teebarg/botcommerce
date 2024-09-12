from sqlmodel import Field

from models.base import BaseModel


class OrderBase(BaseModel):
    shipping_id: int | None = Field(default=None, foreign_key="addresses.id")
    subtotal: float = Field(default=0)
    tax: float = Field(default=0)
    delivery_fee: float = Field(default=0)
    discount: float = Field(default=0)
    total_amount: float = Field(default=0)


class OrderCreate(OrderBase):
    pass


class OrderUpdate(OrderBase):
    pass
