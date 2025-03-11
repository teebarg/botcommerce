from pydantic import EmailStr
from sqlmodel import Field, SQLModel

from app.models.base import BaseModel


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


class UserUpdateMe(SQLModel):
    firstname: str | None = Field(default=None, max_length=255)
    lastname: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class User(UserBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    hashed_password: str = ""
    # addresses: list["Address"] = Relationship(back_populates="user")
    # activity_logs: list["ActivityLog"] = Relationship(back_populates="user")
    # wishlists: list["Wishlist"] = Relationship(back_populates="user")
    # reviews: list["Review"] = Relationship(back_populates="user")


class UserPublic(UserBase):
    id: int | None
    # shipping_addresses: list["Address"] | None = []
    # billing_address: Optional["Address"] = None
