from typing import Optional, Literal
from pydantic import EmailStr, BaseModel, Field

from app.models.base import BM


# Shared properties
class UserBase(BM):
    # email: EmailStr | None = Field(unique=True, index=True, max_length=255)
    status: Literal["PENDING", "ACTIVE", "INACTIVE"] = "PENDING"
    first_name: str | None = Field(default=None, max_length=255)
    last_name: str | None = Field(default=None, max_length=255)
    image: Optional[str] = None
    role: Literal["ADMIN", "CUSTOMER"] = "CUSTOMER"


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    pass


class UserUpdateMe(BaseModel):
    first_name: str | None = Field(default=None, max_length=255)
    last_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class User(UserBase):
    id: int
    hashed_password: str = ""
