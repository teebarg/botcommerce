from sqlmodel import Field

from models.base import BaseModel


class OrderItemBase(BaseModel):
    product_id: int = Field(foreign_key="product.id")
    quantity: int = 0
    price: float = 0


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemUpdate(OrderItemBase):
    pass
