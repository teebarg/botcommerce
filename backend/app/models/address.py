from pydantic import field_validator, BaseModel
from sqlmodel import Field, SQLModel

from app.models.base import BaseModel


class AddressBase(BaseModel):
    firstname: str = Field(max_length=255)
    lastname: str | None = Field(default=None, max_length=255)
    address_1: str = Field(max_length=1255)
    address_2: str | None = Field(default=None, max_length=1255)
    city: str = Field(max_length=255)
    postal_code: str | None = Field(default=None, max_length=255)
    state: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=255)
    is_billing: bool = Field(default=False)

    @field_validator("address_1", "firstname", "city", mode="before")
    def not_empty(cls, v, info):
        if not v or v.strip() == "":
            raise ValueError(f"{info.field_name} cannot be empty")
        return v

class AddressCreate(AddressBase):
    pass


class AddressUpdate(AddressBase):
    pass


class Address(AddressBase, table=True):
    __tablename__ = "addresses"
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(default=None, foreign_key="user.id")


class AddressPublic(AddressBase):
    id: int


class Addresses(BaseModel):
    addresses: list[AddressPublic]
    page: int
    limit: int
    total_count: int
    total_pages: int
