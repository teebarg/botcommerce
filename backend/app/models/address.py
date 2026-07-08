import re
from pydantic import BaseModel, Field, field_validator
from prisma.enums import AddressType
from app.lib.validation import PhoneNumber

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

    class Config:
        from_attributes = True


class AddressCreate(BaseModel):
    first_name: str = Field(..., max_length=255)
    last_name: str | None = Field(default=None, max_length=255)
    address_1: str = Field(..., max_length=1255)
    address_2: str | None = Field(default=None, max_length=1255)
    address_type: AddressType | None = Field(default=None)
    label: str | None = Field(default=None, max_length=255)
    state: str = Field(..., max_length=55)
    phone: PhoneNumber = None

    @field_validator(
        "first_name",
        "address_1",
        "state",
        mode="before"
    )
    def not_empty(cls, v, info):
        if not v or str(v).strip() == "":
            raise ValueError(f"{info.field_name} cannot be empty")
        return v.strip()

    @field_validator(
        "last_name",
        "address_2",
        "label",
        mode="before"
    )
    def empty_to_none(cls, v):
        if v is None:
            return None
        v = v.strip()
        return v if v else None


class AddressUpdate(BaseModel):
    first_name: str | None = Field(default=None, max_length=255)
    last_name: str | None = Field(default=None, max_length=255)
    address_1: str | None = Field(default=None, max_length=1255)
    address_2: str | None = Field(default=None, max_length=1255)
    address_type: AddressType | None = Field(default=None)
    label: str | None = Field(default=None, max_length=255)
    state: str | None = Field(default=None, max_length=255)
    phone: PhoneNumber = None

    @field_validator(
        "first_name",
        "address_1",
        "state",
        mode="before"
    )
    def empty_required_fields(cls, v):
        if v is None:
            return None
        v = v.strip()
        if v == "":
            raise ValueError("Field cannot be empty")
        return v

    @field_validator(
        "last_name",
        "address_2",
        "label",
        mode="before"
    )
    def empty_to_none(cls, v):
        if v is None:
            return None
        v = v.strip()
        return v if v else None

class Addresses(BaseModel):
    addresses: list[Address]
