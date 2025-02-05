import secrets
from typing import Any, Optional

from pydantic import BaseModel
from app.models.reviews import ReviewBase
from sqlmodel import Field, Relationship, SQLModel

from app.models.activities import ActivityBase
from app.models.address import AddressBase
from app.models.brand import BrandBase
from app.models.category import CategoryBase
from app.models.collection import CollectionBase
from app.models.product import ProductBase
from app.models.tag import TagBase
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


# Shared properties
class ProductImages(SQLModel, table=True):
    __tablename__ = "product_images"
    id: int | None = Field(default=None, primary_key=True)
    image: str
    product_id: int | None = Field(default=None, foreign_key="product.id")
    product: "Product" = Relationship(back_populates="images")


class ProductBrand(SQLModel, table=True):
    product_id: int = Field(foreign_key="product.id", primary_key=True)
    brand_id: int = Field(foreign_key="brand.id", primary_key=True)


class ProductCategory(SQLModel, table=True):
    __tablename__ = "product_categories"
    product_id: int = Field(foreign_key="product.id", primary_key=True)
    category_id: int = Field(foreign_key="categories.id", primary_key=True)


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


class Category(CategoryBase, table=True):
    __tablename__ = "categories"
    id: int | None = Field(default=None, primary_key=True)
    slug: str
    parent_id: int | None = Field(foreign_key="categories.id")
    products: list["Product"] = Relationship(
        back_populates="categories", link_model=ProductCategory
    )

    # Relationship to child categories (self-referential)
    parent: Optional["Category"] = Relationship(
        sa_relationship_kwargs={"remote_side": "Category.id"}
    )

    # Relationship to subcategories (self-referential)
    children: list["Category"] = Relationship(
        back_populates="parent",  # Linking parent to children
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class CategoryPublic(CategoryBase):
    id: int
    slug: str
    parent_id: int | None
    parent: Optional["Category"] = None
    # Include subcategories (optional)
    children: list["CategoryPublic"] = []


class Collection(CollectionBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    slug: str
    products: list["Product"] = Relationship(
        back_populates="collections", link_model=ProductCollection
    )


class Review(ReviewBase, table=True):
    __tablename__ = "reviews"
    id: int | None = Field(default=None, primary_key=True)
    product_id: int = Field(default=None, foreign_key="product.id")
    product: "Product" = Relationship(back_populates="reviews")
    user_id: int = Field(default=None, foreign_key="user.id")
    user: "User" = Relationship(back_populates="reviews")


class ReviewPublic(ReviewBase):
    id: int
    user: "User"

class Reviews(SQLModel):
    reviews: list[ReviewPublic]

class PaginatedReviews(Reviews):
    page: int
    limit: int
    total_count: int
    total_pages: int


class Tag(TagBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    slug: str
    # products: list["Product"] = Relationship(
    #     back_populates="tags", link_model=ProductTag
    # )


class Product(ProductBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    slug: str
    images: list["ProductImages"] = Relationship(back_populates="product")
    categories: list["Category"] = Relationship(
        back_populates="products", link_model=ProductCategory
    )
    collections: list["Collection"] = Relationship(
        back_populates="products", link_model=ProductCollection
    )
    # tags: list["Tag"] = Relationship(back_populates="products", link_model=ProductTag)
    brands: list["Brand"] = Relationship(
        back_populates="products", link_model=ProductBrand
    )
    reviews: list[Review] = Relationship(back_populates="product")


class ProductPublic(ProductBase):
    id: int
    slug: str
    images: list[ProductImages] = []
    brands: list[Brand] = []
    categories: list[Category] = []
    collections: list[Collection] = []
    reviews: list[ReviewPublic] = []


class Products(SQLModel):
    products: list[Any]
    facets: Any
    page: int
    limit: int
    total_count: int
    total_pages: int


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
    # product: Product = Relationship(back_populates="product")
    

class Wishlists(SQLModel):
    wishlists: list[Wishlist]