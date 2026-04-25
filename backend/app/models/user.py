from typing import Optional, Literal, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, HttpUrl

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

class EmailData(BaseModel):
    email: EmailStr
    url: HttpUrl

class GooglePayload(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    image: Optional[str] = None

class UserUpdateMe(BaseModel):
    first_name: Optional[str] = Field(default=None, max_length=255)
    last_name: Optional[str] = Field(default=None, max_length=255)
    email: Optional[EmailStr] = None

class User(UserBase):
    id: int
    email: EmailStr

class UserSelf(User):
    wallet_balance: Optional[float] = 0
    created_at: datetime

class UserAdmin(User):
    created_at: datetime
    updated_at: Optional[datetime] = None
    wallet_balance: Optional[float] = 0

class UserInternal(UserBase):
    id: int
    email: EmailStr
    hashed_password: str
    wallet_balance: Optional[float] = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

class PaginatedUsers(BaseModel):
    items: List[UserAdmin]
    next_cursor: int | None
    limit: int

class GuestUserCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=255)
    last_name: str = Field(min_length=1, max_length=255)

class PasswordChange(BaseModel):
    old_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)

class MiniUser(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str

from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "super-admin"

class AuthUser(BaseModel):
    sub: str
    email: EmailStr
    firstName: str
    lastName: str
    image_url: HttpUrl | None = None
    role: UserRole
    roles: List[UserRole]
