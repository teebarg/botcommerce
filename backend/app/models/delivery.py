from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from prisma.enums import ShippingMethod

class DeliveryOptionBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    method: ShippingMethod
    amount: float = Field(..., ge=0)
    is_active: bool = True

class DeliveryOptionCreate(DeliveryOptionBase):
    pass

class DeliveryOptionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    amount: Optional[float] = Field(None, ge=0)
    is_active: Optional[bool] = None
    method: Optional[ShippingMethod] = None

class DeliveryOption(DeliveryOptionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True