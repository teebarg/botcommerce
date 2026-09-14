from prisma.enums import PaymentMethod, PaymentStatus
from pydantic import BaseModel


class Payment(BaseModel):
    id: int
    order_id: int
    amount: float
    reference: str
    transaction_id: str
    status: PaymentStatus
    payment_method: PaymentMethod
