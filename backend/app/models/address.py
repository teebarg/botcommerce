from datetime import datetime
from pydantic import BaseModel, Field
from prisma.enums import AddressType
from app.lib.validation import PhoneNumber, RequiredString, OptionalString

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
    created_at: datetime | None = None

    class Config:
        from_attributes = True

class AddressBase(BaseModel):
    address_type: AddressType | None = None
    label: OptionalString = Field(default=None, max_length=255)
    address_2: OptionalString = Field(default=None, max_length=1255)
    last_name: OptionalString = Field(default=None, max_length=255)
    phone: PhoneNumber = None

class AddressCreate(AddressBase):
    first_name: RequiredString = Field(max_length=255)
    address_1: RequiredString = Field(max_length=1255)
    state: RequiredString = Field(max_length=55)

class AddressUpdate(AddressBase):
    first_name: OptionalString = Field(default=None, max_length=255)
    address_1: OptionalString = Field(default=None, max_length=1255)
    state: OptionalString = Field(default=None, max_length=55)

class Addresses(BaseModel):
    addresses: list[Address]
