from pydantic import BaseModel, Field
from typing import Optional

class BankDetailsBase(BaseModel):
    bank_name: str = Field(..., min_length=1, max_length=255)
    account_name: str = Field(..., min_length=1, max_length=255)
    account_number: str = Field(..., min_length=1, max_length=255)
    is_active: bool = True

class BankDetailsCreate(BankDetailsBase):
    pass

class BankDetailsUpdate(BankDetailsBase):
    bank_name: Optional[str] = None
    account_name: Optional[str] = None
    account_number: Optional[str] = None
    is_active: Optional[bool] = None
