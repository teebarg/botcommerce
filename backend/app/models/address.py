from app.models.base import BM
from pydantic import BaseModel, Field, field_validator
from prisma.enums import AddressType


class AddressBase(BM):
    first_name: str = Field(..., max_length=255)
    last_name: str | None = Field(default=None, max_length=255)
    address_1: str = Field(..., max_length=1255)
    address_2: str | None = Field(default=None, max_length=1255)
    address_type: AddressType | None = Field(default=None, max_length=255)
    label: str | None = Field(default=None, max_length=255)
    city: str = Field(max_length=255)
    state: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=255)
    is_billing: bool = Field(default=False)

    @field_validator("address_1", "first_name", "city", mode="before")
    def not_empty(cls, v, info):
        if not v or v.strip() == "":
            raise ValueError(f"{info.field_name} cannot be empty")
        return v


class Address(AddressBase):
    id: int


class AddressCreate(AddressBase):
    pass


class AddressUpdate(AddressBase):
    first_name: str | None = Field(default=None, max_length=255)
    last_name: str | None = Field(default=None, max_length=255)
    address_1: str | None = Field(default=None, max_length=1255)
    address_2: str | None = Field(default=None, max_length=1255)
    address_type: AddressType | None = Field(default=None, max_length=255)
    label: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=255)
    state: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=255)


class Addresses(BaseModel):
    addresses: list[Address]
    skip: int
    limit: int
    total_count: int
    total_pages: int

class Search(BaseModel):
    results: list[Address]

class BillingAddressCreate(BaseModel):
    first_name: str = Field(..., max_length=255)
    last_name: str | None = Field(default=None, max_length=255)
    address_1: str = Field(..., max_length=1255)
    address_2: str | None = Field(default=None, max_length=1255)
    address_type: AddressType | None = Field(default=None, max_length=255)
    label: str | None = Field(default=None, max_length=255)
    city: str = Field(max_length=255)
    state: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=255)
