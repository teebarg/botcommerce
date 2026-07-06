from typing import Optional, Literal, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator, HttpUrl
from enum import Enum

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
    phone: str | None = Field(
        default=None,
        pattern=r"^(?:\+234|234|0)(7[0-9]|8[0-9]|9[0-9])\d{8}$",
    )

    @field_validator("phone")
    @classmethod
    def normalize_phone(cls, value: str | None) -> str | None:
        if value is None:
            return value

        # Remove spaces, dashes, parentheses
        value = "".join(c for c in value if c.isdigit() or c == "+")

        if value.startswith("0"):
            return "+234" + value[1:]
        elif value.startswith("234"):
            return "+" + value
        elif value.startswith("+234"):
            return value

        raise ValueError("Invalid Nigerian phone number")

class EmailData(BaseModel):
    email: EmailStr
    url: HttpUrl

class UserUpdateMe(BaseModel):
    first_name: Optional[str] = Field(default=None, max_length=255)
    last_name: Optional[str] = Field(default=None, max_length=255)
    phone: str | None = Field(
        default=None,
        pattern=r"^(?:\+234|234|0)(7[0-9]|8[0-9]|9[0-9])\d{8}$",
    )

    @field_validator("phone")
    @classmethod
    def normalize_phone(cls, value: str | None) -> str | None:
        if value is None:
            return value

        # Remove spaces, dashes, parentheses
        value = "".join(c for c in value if c.isdigit() or c == "+")

        if value.startswith("0"):
            return "+234" + value[1:]
        elif value.startswith("234"):
            return "+" + value
        elif value.startswith("+234"):
            return value

        raise ValueError("Invalid Nigerian phone number")

class User(UserBase):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True

class UserSelf(User):
    wallet_balance: Optional[float] = 0
    created_at: datetime

class UserAdmin(User):
    phone: Optional[str] = None
    wallet_balance: Optional[float] = 0
    created_at: datetime

class UserInternal(UserBase):
    id: int
    email: EmailStr
    hashed_password: str
    wallet_balance: Optional[float] = 0
    created_at: datetime

class PaginatedUsers(BaseModel):
    items: List[UserAdmin]
    next_cursor: int | None
    limit: int

    class Config:
        from_attributes = True

class GuestUserCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=255)
    last_name: str = Field(min_length=1, max_length=255)

class MiniUser(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None

    class Config:
        from_attributes = True

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "super-admin"

class AuthUser(BaseModel):
    sub: str
    email: EmailStr
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    image_url: HttpUrl | None = None
    role: UserRole
    roles: List[UserRole]
