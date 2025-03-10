import secrets
from typing import Any, Optional

from pydantic import BaseModel
from sqlmodel import Field, Relationship, SQLModel

from app.models.activities import ActivityBase
from app.models.address import AddressBase
from app.models.user import UserBase
from app.models.wishlist import WishlistBase


class ContactFormCreate(BaseModel):
    name: str
    email: str
    phone: str | int | None = ""
    message: str = "bearer"


class NewsletterCreate(BaseModel):
    email: str


class UploadStatus(BaseModel):
    total_rows: int
    processed_rows: int
    status: str


class CartItemIn(BaseModel):
    product_id: str
    quantity: int


class CartDetails(BaseModel):
    shipping_address: dict | None = None
    billing_address: dict | None = None
    email: str | None = None
    shipping_method: dict | None = None
    payment_session: dict | None = None


class OrderDetails(BaseModel):
    fulfillments: list[dict] | None = None
    fulfillment_status: str | None = None
    payment_status: str | None = None
    status: str | None = None


class User(UserBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    hashed_password: str = secrets.token_urlsafe(6)
    addresses: list["Address"] = Relationship(back_populates="user")
    activity_logs: list["ActivityLog"] = Relationship(back_populates="user")
    wishlists: list["Wishlist"] = Relationship(back_populates="user")
    reviews: list["Review"] = Relationship(back_populates="user")


class UserPublic(UserBase):
    id: int | None
    shipping_addresses: list["Address"] | None = []
    billing_address: Optional["Address"] = None


class ActivityLog(ActivityBase, table=True):
    __tablename__ = "activity_logs"

    id: int | None = Field(default=None, primary_key=True, index=True)
    user_id: int = Field(foreign_key="user.id")
    activity_type: str | None = Field(
        index=True, max_length=255
    )  # E.g., "purchase", "viewed product", "profile updated"
    description: str | None = Field(max_length=255)

    user: User = Relationship(back_populates="activity_logs")


class Address(AddressBase, table=True):
    __tablename__ = "addresses"
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(default=None, foreign_key="user.id")
    user: User = Relationship(back_populates="addresses")


class AddressPublic(AddressBase):
    id: int


class Addresses(SQLModel):
    addresses: list[AddressPublic]
    page: int
    limit: int
    total_count: int
    total_pages: int


# Database model, database table inferred from class name
class Wishlist(WishlistBase, table=True):
    __tablename__ = "wishlists"
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", nullable=False, ondelete="CASCADE")
    user: User = Relationship(back_populates="wishlists")
    product_id: int = Field(
        foreign_key="product.id", nullable=False, ondelete="CASCADE"
    )
    

class Wishlists(SQLModel):
    wishlists: list[Wishlist]