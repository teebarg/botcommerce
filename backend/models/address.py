from sqlmodel import Field

from models.base import BaseModel


class AddressBase(BaseModel):
    firstname: str | None = Field(default=None, max_length=255)
    lastname: str | None = Field(default=None, max_length=255)
    address_1: str | None = Field(default=None, max_length=1255)
    address_2: str | None = Field(default=None, max_length=1255)
    city: str | None = Field(default=None, max_length=255)
    postal_code: str | None = Field(default=None, max_length=255)
    state: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=255)


class AddressCreate(AddressBase):
    pass


class AddressUpdate(AddressBase):
    pass
