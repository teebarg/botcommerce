from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from prisma.enums import PaymentStatus

class PaymentBase(BaseModel):
    amount: float
    reference: str
    payment_method: str
    metadata: Optional[Dict[str, Any]] = None

class PaymentCreate(PaymentBase):
    order_id: int
    user_id: int

class PaymentResponse(PaymentBase):
    id: int
    order_id: int
    user_id: int
    status: PaymentStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PaymentInitialize(BaseModel):
    authorization_url: str
    reference: str
    access_code: str

class PaymentVerify(BaseModel):
    status: str
    message: str
    payment_id: Optional[int] = None
