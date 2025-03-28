# from enum import Enum
from pydantic import BaseModel, Field
from prisma.models import PaymentStatus

# class PaymentStatus(str, Enum):
#     pending = "pending"
#     success = "success"
#     failed = "failed"
#     refunded = "refunded"

class Payment(BaseModel):
    id: int = Field(default_factory=lambda: nextval("payments_id_seq"))
    order_id: int = Field(...)
    user_id: int = Field(...)
    amount: float = Field(...)
    reference: str = Field(...)
    transaction_id: str = Field(...)
    status: PaymentStatus = Field(default=PaymentStatus.PENDING)
    payment_method: str = Field(...)
    # metadata: dict = Field(default=None)
