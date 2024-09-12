from models.base import BaseModel


class CartBase(BaseModel):
    session_id: str


class CartCreate(CartBase):
    pass


class CartUpdate(CartBase):
    pass
