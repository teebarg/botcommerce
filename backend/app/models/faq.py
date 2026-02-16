from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field

class FAQBase(BaseModel):
    category: Optional[str] = None

class FAQ(FAQBase):
    id: int
    question: str
    answer: str
    is_active: bool
    created_at: datetime

class FAQCreate(FAQBase):
    question: str = Field(..., min_length=1, max_length=50)
    answer: str = Field(..., min_length=1, max_length=255)
    is_active: bool = True

class FAQUpdate(FAQBase):
    question: Optional[str] = None
    answer: Optional[str] = None
    is_active: Optional[bool] = None
