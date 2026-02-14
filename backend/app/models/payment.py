# from enum import Enum
from pydantic import BaseModel, Field

class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class Payment(BaseModel):
    id: int = Field(default_factory=lambda: nextval("payments_id_seq"))
    order_id: int = Field(...)
    user_id: int = Field(...)
    amount: float = Field(...)
    reference: str = Field(...)
    transaction_id: str = Field(...)
    status: PaymentStatus = Field(default=PaymentStatus.PENDING)
    payment_method: str = Field(...)
