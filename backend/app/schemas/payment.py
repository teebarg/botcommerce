from pydantic import BaseModel

class PaymentInitialize(BaseModel):
    authorization_url: str
    reference: str
    access_code: str
