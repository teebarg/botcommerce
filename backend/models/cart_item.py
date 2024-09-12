from sqlmodel import Field

from models.base import BaseModel


class CartItemBase(BaseModel):
    product_id: int = Field(foreign_key="product.id")
    quantity: int = 0


class CartItemCreate(CartItemBase):
    pass


class CartItemUpdate(CartItemBase):
    pass
