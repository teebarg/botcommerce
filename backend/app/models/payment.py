from pydantic import BaseModel
from prisma.enums import PaymentStatus, PaymentMethod

class Payment(BaseModel):
    id: int
    order_id: int
    amount: float
    reference: str
    transaction_id: str
    status: PaymentStatus
    payment_method: PaymentMethod
