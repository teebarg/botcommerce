from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    first_name: Optional[str] = Field(default=None, max_length=255)
    last_name: Optional[str] = Field(default=None, max_length=255)
    image: Optional[str] = None
    role: Literal["ADMIN", "CUSTOMER"] = "CUSTOMER"
    status: Literal["PENDING", "ACTIVE", "INACTIVE"] = "PENDING"
    referral_code: Optional[str] = None

class UserCreate(UserBase):
    email: EmailStr
    password: str

class UserUpdate(UserBase):
    pass

class UserUpdateMe(BaseModel):
    first_name: Optional[str] = Field(default=None, max_length=255)
    last_name: Optional[str] = Field(default=None, max_length=255)
    email: Optional[EmailStr] = None

class User(UserBase):
    id: int

class UserSelf(User):
    email: EmailStr
    wallet_balance: Optional[float] = None
    created_at: datetime

class UserAdmin(User):
    email: EmailStr
    created_at: datetime
    updated_at: datetime
    wallet_balance: Optional[float] = None

class UserInternal(UserBase):
    id: int
    email: EmailStr
    hashed_password: str
    wallet_balance: Optional[float] = None
    created_at: datetime
    updated_at: datetime
