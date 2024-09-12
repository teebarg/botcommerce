from pydantic import EmailStr
from sqlmodel import Field

from models.base import BaseModel


# Shared properties
class UserBase(BaseModel):
    email: EmailStr | None = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    firstname: str | None = Field(default=None, max_length=255)
    lastname: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)
