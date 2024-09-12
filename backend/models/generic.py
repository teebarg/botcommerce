import secrets
from datetime import datetime, timezone
from typing import List, Optional

from pydantic import BaseModel
from sqlmodel import Field, Relationship, SQLModel

from models.address import AddressBase
from models.brand import BrandBase
from models.cart import CartBase
from models.cart_item import CartItemBase
from models.collection import CollectionBase
from models.order import OrderBase
from models.order_item import OrderItemBase
from models.product import ProductBase
from models.tag import TagBase
from models.user import UserBase


class ContactFormCreate(BaseModel):
    name: str
    email: str
    phone: str | int | None = ""
    message: str = "bearer"


class UploadStatus(BaseModel):
    total_rows: int
    processed_rows: int
    status: str


# Shared properties
class ProductBrand(SQLModel, table=True):
    product_id: int = Field(foreign_key="product.id", primary_key=True)
    brand_id: int = Field(foreign_key="brand.id", primary_key=True)


class ProductCollection(SQLModel, table=True):
    product_id: int = Field(foreign_key="product.id", primary_key=True)
    collection_id: int = Field(foreign_key="collection.id", primary_key=True)


class ProductTag(SQLModel, table=True):
    product_id: int = Field(foreign_key="product.id", primary_key=True)
    tag_id: int = Field(foreign_key="tag.id", primary_key=True)


class Brand(BrandBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    slug: str
    products: list["Product"] = Relationship(
        back_populates="brands", link_model=ProductBrand
    )


class Collection(CollectionBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    slug: str
    products: list["Product"] = Relationship(
        back_populates="collections", link_model=ProductCollection
    )


class Tag(TagBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    slug: str
    products: list["Product"] = Relationship(
        back_populates="tags", link_model=ProductTag
    )


class Product(ProductBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    slug: str
    collections: list["Collection"] = Relationship(
        back_populates="products", link_model=ProductCollection
    )
    tags: list["Tag"] = Relationship(back_populates="products", link_model=ProductTag)
    brands: list["Brand"] = Relationship(
        back_populates="products", link_model=ProductBrand
    )


class ProductPublic(ProductBase):
    id: int
    slug: str
    collections: list[Collection] = []
    tags: list[Tag] = []
    brands: list[Brand] = []


class Products(SQLModel):
    products: list[ProductPublic]
    page: int
    per_page: int
    total_count: int
    total_pages: int


class User(UserBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    hashed_password: str = secrets.token_urlsafe(6)
    carts: List["Cart"] = Relationship(back_populates="user")
    addresses: List["Address"] = Relationship(back_populates="user")
    orders: List["Order"] = Relationship(back_populates="user")


class Cart(CartBase, table=True):
    id: int | None = Field(default=None, primary_key=True)

    items: list["CartItem"] = Relationship(back_populates="cart")

    user_id: int | None = Field(default=None, foreign_key="user.id")
    user: User | None = Relationship(back_populates="carts")


class CartItem(CartItemBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    cart_id: int = Field(default=None, foreign_key="cart.id")
    cart: Cart | None = Relationship(back_populates="items")
    product_id: int | None = Field(default=None, foreign_key="product.id")
    product: Product = Relationship()


class CartItemPublic(CartItemBase):
    id: int
    product: Product


class CartPublic(CartBase):
    id: int
    items: list[CartItemPublic] = []


class Address(AddressBase, table=True):
    __tablename__ = "addresses"
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="user.id")
    user: User | None = Relationship(back_populates="addresses")


class AddressPublic(AddressBase):
    id: int


class Addresses(SQLModel):
    addresses: list[AddressPublic]
    page: int
    per_page: int
    total_count: int
    total_pages: int


class Order(OrderBase, table=True):
    __tablename__ = "orders"
    id: Optional[int] = Field(default=None, primary_key=True)
    order_number: str | None = Field(default=None, max_length=255)
    order_date: datetime | None = Field(default=datetime.now(timezone.utc))
    status: str | None = Field(default=None, max_length=255)
    user_id: int | None = Field(default=None, foreign_key="user.id")
    user: User | None = Relationship(back_populates="orders")
    shipping_id: int | None = Field(default=None, foreign_key="addresses.id")
    shipping: Address = Relationship()

    items: list["OrderItem"] = Relationship(back_populates="order")


class OrderItem(OrderItemBase, table=True):
    __tablename__ = "order_items"
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int | None = Field(default=None, foreign_key="orders.id")
    order: Order | None = Relationship(back_populates="items")
    product_id: int | None = Field(default=None, foreign_key="product.id")
    product: Product = Relationship()


class OrderItemPublic(OrderItemBase):
    id: int
    product: Product


class OrderPublic(OrderBase):
    id: int
    order_number: str
    order_date: datetime
    status: str
    items: list["OrderItemPublic"] = []


class Orders(SQLModel):
    orders: list[OrderPublic]
    page: int
    per_page: int
    total_count: int
    total_pages: int


class OrderItems(SQLModel):
    order_items: list[OrderItemPublic]
    page: int
    per_page: int
    total_count: int
    total_pages: int
