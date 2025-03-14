from app.models.base import BM
from pydantic import BaseModel, Field, field_validator


class AddressBase(BM):
    name: str = Field(..., min_length=1, description="Name is required")
    is_active: bool = True
    firstname: str = Field(..., max_length=255)
    lastname: str | None = Field(default=None, max_length=255)
    address_1: str = Field(..., max_length=1255)
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


class Address(AddressBase):
    id: int
    slug: str = Field(..., min_length=1)


class AddressCreate(AddressBase):
    pass


class AddressUpdate(AddressBase):
    pass


class Addresses(BaseModel):
    addresses: list[Address]
    page: int
    limit: int
    total_count: int
    total_pages: int

class Search(BaseModel):
    results: list[Address]
