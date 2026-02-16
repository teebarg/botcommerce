from pydantic import BaseModel, Field, field_validator
from prisma.enums import AddressType

class Address(BaseModel):
    id: int
    first_name: str
    last_name: str | None
    address_1: str
    address_2: str | None
    address_type: AddressType | None
    label: str | None
    state: str | None
    phone: str | None
    is_billing: bool


class AddressCreate(BaseModel):
    first_name: str = Field(..., max_length=255)
    last_name: str | None = Field(default=None, max_length=255)
    address_1: str = Field(..., max_length=1255)
    address_2: str | None = Field(default=None, max_length=1255)
    address_type: AddressType | None = Field(default=None, max_length=255)
    label: str | None = Field(default=None, max_length=255)
    city: str | None = Field(max_length=255)
    state: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=255)
    is_billing: bool = Field(default=False)

    @field_validator("address_1", "first_name", mode="before")
    def not_empty(cls, v, info):
        if not v or v.strip() == "":
            raise ValueError(f"{info.field_name} cannot be empty")
        return v


class AddressUpdate(BaseModel):
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
