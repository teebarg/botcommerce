from pydantic import BaseModel

class PaymentCreate(BaseModel):
    order_id: int
    amount: float
    reference: str
    transaction_id: str

class PaymentInitialize(BaseModel):
    authorization_url: str
    reference: str
    access_code: str
