from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class BankDetailsCreate(BaseModel):
    bank_name: str = Field(..., min_length=1, max_length=50)
    account_name: str = Field(..., min_length=1, max_length=255)
    account_number: str = Field(..., min_length=10, max_length=20)
    is_active: bool = True

class BankDetailsUpdate(BaseModel):
    bank_name: Optional[str] = None
    account_name: Optional[str] = None
    account_number: Optional[str] = None
    is_active: Optional[bool] = None

class BankDetails(BaseModel):
    id: int
    bank_name: str
    account_name: str
    account_number: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
