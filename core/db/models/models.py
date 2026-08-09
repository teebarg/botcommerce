from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    Enum as SAEnum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
    text,
    Table,
    Column,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


# ============================================================
# Base
# ============================================================


class Base(DeclarativeBase):
    pass


# ============================================================
# Enums
# ============================================================


class AddressType(str, enum.Enum):
    HOME = "HOME"
    WORK = "WORK"
    BILLING = "BILLING"
    SHIPPING = "SHIPPING"
    OTHER = "OTHER"


class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELED = "CANCELED"
    REFUNDED = "REFUNDED"


class DiscountType(str, enum.Enum):
    PERCENTAGE = "PERCENTAGE"
    FIXED_AMOUNT = "FIXED_AMOUNT"


class CouponScope(str, enum.Enum):
    GENERAL = "GENERAL"
    SPECIFIC_USERS = "SPECIFIC_USERS"


class PaymentMethod(str, enum.Enum):
    CREDIT_CARD = "CREDIT_CARD"
    CASH_ON_DELIVERY = "CASH_ON_DELIVERY"
    BANK_TRANSFER = "BANK_TRANSFER"
    PAYSTACK = "PAYSTACK"
    COUPON = "COUPON"
    WALLET = "WALLET"


class ProductStatus(str, enum.Enum):
    IN_STOCK = "IN_STOCK"
    OUT_OF_STOCK = "OUT_OF_STOCK"


class CartStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    ABANDONED = "ABANDONED"
    CONVERTED = "CONVERTED"


class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    FAILED = "FAILED"
    SUCCESS = "SUCCESS"
    REFUNDED = "REFUNDED"


class ShippingMethod(str, enum.Enum):
    STANDARD = "STANDARD"
    EXPRESS = "EXPRESS"
    PICKUP = "PICKUP"


class Role(str, enum.Enum):
    ADMIN = "admin"
    CUSTOMER = "customer"


class Status(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    INACTIVE = "inactive"


class WalletTransactionType(str, enum.Enum):
    CASHBACK = "CASHBACK"
    WITHDRAWAL = "WITHDRAWAL"
    ADJUSTMENT = "ADJUSTMENT"
    REVERSAL = "REVERSAL"


# ============================================================
# PostgreSQL enum helpers
# ============================================================


address_type_enum = SAEnum(
    AddressType,
    name="AddressType",
    native_enum=True,
)

order_status_enum = SAEnum(
    OrderStatus,
    name="OrderStatus",
    native_enum=True,
)

discount_type_enum = SAEnum(
    DiscountType,
    name="DiscountType",
    native_enum=True,
)

coupon_scope_enum = SAEnum(
    CouponScope,
    name="CouponScope",
    native_enum=True,
)

payment_method_enum = SAEnum(
    PaymentMethod,
    name="PaymentMethod",
    native_enum=True,
)

product_status_enum = SAEnum(
    ProductStatus,
    name="ProductStatus",
    native_enum=True,
)

cart_status_enum = SAEnum(
    CartStatus,
    name="CartStatus",
    native_enum=True,
)

payment_status_enum = SAEnum(
    PaymentStatus,
    name="PaymentStatus",
    native_enum=True,
)

shipping_method_enum = SAEnum(
    ShippingMethod,
    name="ShippingMethod",
    native_enum=True,
)

role_enum = SAEnum(
    Role,
    name="roles",
    native_enum=True,
)

status_enum = SAEnum(
    Status,
    name="statuses",
    native_enum=True,
)

wallet_transaction_type_enum = SAEnum(
    WalletTransactionType,
    name="WalletTransactionType",
    native_enum=True,
)


# ============================================================
# Association tables
# ============================================================


product_categories = Table(
    "ProductCategories",
    Base.metadata,
    Column(
        "A",
        ForeignKey("categories.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "B",
        ForeignKey("products.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


product_collections = Table(
    "ProductCollections",
    Base.metadata,
    Column(
        "A",
        ForeignKey("collections.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "B",
        ForeignKey("products.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


product_tags = Table(
    "ProductTags",
    Base.metadata,
    Column(
        "A",
        ForeignKey("products.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "B",
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


shared_collection_products = Table(
    "SharedCollectionProducts",
    Base.metadata,
    Column(
        "A",
        ForeignKey("products.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "B",
        ForeignKey("shared_collections.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


coupon_allowed_users = Table(
    "CouponAllowedUser",
    Base.metadata,
    Column(
        "A",
        ForeignKey("coupons.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "B",
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


# ============================================================
# User
# ============================================================


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    clerk_id: Mapped[str | None] = mapped_column(
        String,
        unique=True,
    )

    email: Mapped[str] = mapped_column(
        String,
        unique=True,
        nullable=False,
    )

    phone: Mapped[str | None] = mapped_column(String)

    hashed_password: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    first_name: Mapped[str | None] = mapped_column(String)
    last_name: Mapped[str | None] = mapped_column(String)

    status: Mapped[Status] = mapped_column(
        status_enum,
        nullable=False,
        server_default=text("'pending'"),
    )

    role: Mapped[Role] = mapped_column(
        role_enum,
        nullable=False,
        server_default=text("'customer'"),
    )

    image: Mapped[str | None] = mapped_column(String)

    email_verified: Mapped[datetime | None] = mapped_column(
        DateTime,
    )

    email_verification_token: Mapped[str | None] = mapped_column(String)

    email_verification_expires: Mapped[datetime | None] = mapped_column(
        DateTime,
    )

    referral_code: Mapped[str | None] = mapped_column(
        String,
        unique=True,
    )

    wallet_balance: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        server_default="0",
    )

    created_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        onupdate=func.now(),
    )

    orders: Mapped[list["Order"]] = relationship(
        back_populates="user",
    )

    addresses: Mapped[list["Address"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )

    reviews: Mapped[list["Review"]] = relationship(
        back_populates="user",
    )

    favorites: Mapped[list["Favorite"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )

    carts: Mapped[list["Cart"]] = relationship(
        back_populates="user",
    )

    coupons: Mapped[list["Coupon"]] = relationship(
        secondary=coupon_allowed_users,
        back_populates="users",
    )

    coupon_usages: Mapped[list["CouponUsage"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )

    wallet_transactions: Mapped[list["WalletTransaction"]] = relationship(
        back_populates="user",
    )

    __table_args__ = (
        Index(
            "users_first_name_last_name_email_idx",
            "first_name",
            "last_name",
            "email",
        ),
    )


# ============================================================
# Address
# ============================================================


class Address(Base):
    __tablename__ = "addresses"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    label: Mapped[str | None] = mapped_column(String)

    address_type: Mapped[AddressType] = mapped_column(
        address_type_enum,
        nullable=False,
        server_default="HOME",
    )

    first_name: Mapped[str | None] = mapped_column(String)
    last_name: Mapped[str | None] = mapped_column(String)

    address_1: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    address_2: Mapped[str | None] = mapped_column(String)
    city: Mapped[str | None] = mapped_column(String)
    state: Mapped[str | None] = mapped_column(String)
    phone: Mapped[str | None] = mapped_column(String)

    is_billing: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="false",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        back_populates="addresses",
    )

    shipping_orders: Mapped[list["Order"]] = relationship(
        foreign_keys="Order.shipping_address_id",
        back_populates="shipping_address",
    )

    billing_orders: Mapped[list["Order"]] = relationship(
        foreign_keys="Order.billing_address_id",
        back_populates="billing_address",
    )

    __table_args__ = (
        Index("addresses_user_id_idx", "user_id"),
        Index("addresses_is_billing_idx", "is_billing"),
    )


# ============================================================
# Brand
# ============================================================


class Brand(Base):
    __tablename__ = "brands"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    products: Mapped[list["Product"]] = relationship(
        back_populates="brand",
    )


# ============================================================
# Category
# ============================================================


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String,
        unique=True,
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String,
        unique=True,
        nullable=False,
    )

    image: Mapped[str | None] = mapped_column(String)

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="true",
    )

    display_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        server_default="0",
    )

    parent_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "categories.id",
            ondelete="CASCADE",
        ),
    )

    parent: Mapped["Category | None"] = relationship(
        "Category",
        remote_side=[id],
        back_populates="subcategories",
    )

    subcategories: Mapped[list["Category"]] = relationship(
        "Category",
        back_populates="parent",
    )

    products: Mapped[list["Product"]] = relationship(
        secondary=product_categories,
        back_populates="categories",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


# ============================================================
# Collection
# ============================================================


class Collection(Base):
    __tablename__ = "collections"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )

    products: Mapped[list["Product"]] = relationship(
        secondary=product_collections,
        back_populates="collections",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


# ============================================================
# Tag
# ============================================================


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="true",
    )

    products: Mapped[list["Product"]] = relationship(
        secondary=product_tags,
        back_populates="tags",
    )


# ============================================================
# Product
# ============================================================


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str | None] = mapped_column(
        String(255),
    )

    slug: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    sku: Mapped[str] = mapped_column(
        String,
        unique=True,
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(String)

    features: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB,
    )

    image: Mapped[str | None] = mapped_column(
        String(255),
    )

    active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="true",
    )

    is_new: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="false",
    )

    ratings: Mapped[float | None] = mapped_column(
        Float,
        server_default="0",
    )

    brand_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "brands.id",
            ondelete="SET NULL",
        ),
    )

    embedding: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    brand: Mapped["Brand | None"] = relationship(
        back_populates="products",
    )

    variants: Mapped[list["ProductVariant"]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan",
    )

    categories: Mapped[list["Category"]] = relationship(
        secondary=product_categories,
        back_populates="products",
    )

    collections: Mapped[list["Collection"]] = relationship(
        secondary=product_collections,
        back_populates="products",
    )

    tags: Mapped[list["Tag"]] = relationship(
        secondary=product_tags,
        back_populates="products",
    )

    images: Mapped[list["ProductImage"]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan",
    )

    reviews: Mapped[list["Review"]] = relationship(
        back_populates="product",
    )

    favorites: Mapped[list["Favorite"]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan",
    )

    shared_collections: Mapped[list["SharedCollection"]] = relationship(
        secondary=shared_collection_products,
        back_populates="products",
    )

    __table_args__ = (
        Index(
            "products_name_slug_idx",
            "name",
            "slug",
        ),
    )


# ============================================================
# ProductVariant
# ============================================================


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey(
            "products.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    sku: Mapped[str] = mapped_column(
        String,
        unique=True,
        nullable=False,
    )

    status: Mapped[ProductStatus] = mapped_column(
        product_status_enum,
        nullable=False,
        server_default="IN_STOCK",
    )

    price: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    old_price: Mapped[float | None] = mapped_column(Float)

    inventory: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    size: Mapped[str | None] = mapped_column(String)
    color: Mapped[str | None] = mapped_column(String)
    measurement: Mapped[int | None] = mapped_column(Integer)
    width: Mapped[int | None] = mapped_column(Integer)
    length: Mapped[int | None] = mapped_column(Integer)
    age: Mapped[str | None] = mapped_column(String)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    product: Mapped["Product"] = relationship(
        back_populates="variants",
    )

    order_items: Mapped[list["OrderItem"]] = relationship(
        back_populates="variant",
    )

    cart_items: Mapped[list["CartItem"]] = relationship(
        back_populates="variant",
    )

    __table_args__ = (
        Index("product_variants_product_id_idx", "product_id"),
        Index("product_variants_status_idx", "status"),
    )


# ============================================================
# ProductImage
# ============================================================


class ProductImage(Base):
    __tablename__ = "product_images"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    image: Mapped[str | None] = mapped_column(
        String(255),
    )

    product_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "products.id",
            ondelete="CASCADE",
        ),
    )

    order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        server_default="1",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    product: Mapped["Product | None"] = relationship(
        back_populates="images",
    )

    __table_args__ = (
        Index("product_images_product_id_idx", "product_id"),
        Index(
            "product_images_product_id_order_idx",
            "product_id",
            "order",
        ),
    )


# ============================================================
# Review
# ============================================================


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    author: Mapped[str | None] = mapped_column(String)
    title: Mapped[str | None] = mapped_column(String)

    comment: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    rating: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    verified: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="false",
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="NO ACTION",
        ),
        nullable=False,
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey(
            "products.id",
            ondelete="NO ACTION",
        ),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    product: Mapped["Product"] = relationship(
        back_populates="reviews",
    )

    user: Mapped["User"] = relationship(
        back_populates="reviews",
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "product_id",
        ),
        Index("reviews_product_id_idx", "product_id"),
        Index("reviews_user_id_idx", "user_id"),
        Index("reviews_rating_idx", "rating"),
        Index("reviews_created_at_idx", "created_at"),
        Index(
            "reviews_product_id_id_desc_idx",
            "product_id",
            text("id DESC"),
        ),
        Index(
            "reviews_created_at_id_desc_idx",
            text("created_at DESC"),
            text("id DESC"),
        ),
    )


# ============================================================
# Order
# ============================================================


class Order123(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    order_number: Mapped[str] = mapped_column(
        String,
        unique=True,
        nullable=False,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="NO ACTION",
        ),
        nullable=False,
    )

    shipping_address_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "addresses.id",
            ondelete="SET NULL",
        ),
    )

    billing_address_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "addresses.id",
            ondelete="SET NULL",
        ),
    )

    email: Mapped[str | None] = mapped_column(String)
    phone: Mapped[str | None] = mapped_column(String)

    total: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    subtotal: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    tax: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    discount_amount: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        server_default="0",
    )

    wallet_used: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        server_default="0",
    )

    status: Mapped[OrderStatus] = mapped_column(
        order_status_enum,
        nullable=False,
        server_default="PENDING",
    )

    payment_method: Mapped[PaymentMethod] = mapped_column(
        payment_method_enum,
        nullable=False,
    )

    payment_status: Mapped[PaymentStatus | None] = mapped_column(
        payment_status_enum,
        server_default="PENDING",
    )

    shipping_method: Mapped[ShippingMethod | None] = mapped_column(
        shipping_method_enum,
    )

    shipping_fee: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    coupon_code: Mapped[str | None] = mapped_column(String)

    coupon_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "coupons.id",
            ondelete="NO ACTION",
        ),
    )

    cart_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "carts.id",
            ondelete="NO ACTION",
        ),
        unique=True,
    )

    order_notes: Mapped[str | None] = mapped_column(Text)
    invoice_url: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        back_populates="orders",
    )

    shipping_address: Mapped["Address | None"] = relationship(
        foreign_keys=[shipping_address_id],
        back_populates="shipping_orders",
    )

    billing_address: Mapped["Address | None"] = relationship(
        foreign_keys=[billing_address_id],
        back_populates="billing_orders",
    )

    order_items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan",
    )

    payment: Mapped["Payment | None"] = relationship(
        back_populates="order",
        uselist=False,
    )

    coupon: Mapped["Coupon | None"] = relationship(
        back_populates="orders",
    )

    cart: Mapped["Cart | None"] = relationship(
        back_populates="order",
    )

    timeline: Mapped[list["OrderTimeline"]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index("orders_user_id_idx", "user_id"),
        Index("orders_status_idx", "status"),
        Index("orders_created_at_idx", "created_at"),
        Index("orders_payment_status_idx", "payment_status"),
        Index(
            "orders_user_id_created_at_idx",
            "user_id",
            text("created_at DESC"),
        ),
        Index(
            "orders_status_created_at_idx",
            "status",
            text("created_at DESC"),
        ),
        Index(
            "orders_payment_status_created_at_idx",
            "payment_status",
            text("created_at DESC"),
        ),
        Index(
            "orders_user_id_status_idx",
            "user_id",
            "status",
        ),
    )


# ============================================================
# OrderTimeline
# ============================================================


class OrderTimeline(Base):
    __tablename__ = "order_timeline"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    order_id: Mapped[int] = mapped_column(
        ForeignKey(
            "orders.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    from_status: Mapped[OrderStatus | None] = mapped_column(
        order_status_enum,
    )

    to_status: Mapped[OrderStatus | None] = mapped_column(
        order_status_enum,
    )

    message: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    order: Mapped["Order"] = relationship(
        back_populates="timeline",
    )

    __table_args__ = (
        Index(
            "order_timeline_order_id_created_at_idx",
            "order_id",
            "created_at",
        ),
    )


# ============================================================
# OrderItem
# ============================================================


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str | None] = mapped_column(String)

    order_id: Mapped[int] = mapped_column(
        ForeignKey(
            "orders.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    variant_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "product_variants.id",
            ondelete="SET NULL",
        ),
    )

    active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="true",
    )

    image: Mapped[str | None] = mapped_column(String)

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    price: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    order: Mapped["Order"] = relationship(
        back_populates="order_items",
    )

    variant: Mapped["ProductVariant | None"] = relationship(
        back_populates="order_items",
    )

    __table_args__ = (
        Index("order_items_order_id_idx", "order_id"),
        Index("order_items_variant_id_idx", "variant_id"),
    )


# ============================================================
# Payment
# ============================================================


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    order_id: Mapped[int] = mapped_column(
        ForeignKey(
            "orders.id",
            ondelete="NO ACTION",
        ),
        unique=True,
        nullable=False,
    )

    amount: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    payment_method: Mapped[PaymentMethod] = mapped_column(
        payment_method_enum,
        nullable=False,
    )

    status: Mapped[PaymentStatus] = mapped_column(
        payment_status_enum,
        nullable=False,
        server_default="PENDING",
    )

    reference: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    transaction_id: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    order: Mapped["Order"] = relationship(
        back_populates="payment",
    )


# ============================================================
# Coupon
# ============================================================


class Coupon(Base):
    __tablename__ = "coupons"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    code: Mapped[str] = mapped_column(
        String,
        unique=True,
        nullable=False,
    )

    discount_type: Mapped[DiscountType] = mapped_column(
        discount_type_enum,
        nullable=False,
        server_default="PERCENTAGE",
    )

    discount_value: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    min_cart_value: Mapped[float | None] = mapped_column(Float)

    min_item_quantity: Mapped[int | None] = mapped_column(
        Integer,
        server_default="0",
    )

    valid_from: Mapped[datetime | None] = mapped_column(DateTime)
    valid_until: Mapped[datetime | None] = mapped_column(DateTime)

    max_uses: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        server_default="1",
    )

    max_uses_per_user: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        server_default="1",
    )

    current_uses: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        server_default="0",
    )

    scope: Mapped[CouponScope] = mapped_column(
        coupon_scope_enum,
        nullable=False,
        server_default="GENERAL",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="true",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    usages: Mapped[list["CouponUsage"]] = relationship(
        back_populates="coupon",
        cascade="all, delete-orphan",
    )

    orders: Mapped[list["Order"]] = relationship(
        back_populates="coupon",
    )

    carts: Mapped[list["Cart"]] = relationship(
        back_populates="coupon",
    )

    users: Mapped[list["User"]] = relationship(
        secondary=coupon_allowed_users,
        back_populates="coupons",
    )

    __table_args__ = (
        Index("coupons_code_idx", "code"),
        Index("coupons_is_active_idx", "is_active"),
        Index(
            "coupons_valid_from_valid_until_idx",
            "valid_from",
            "valid_until",
        ),
    )


# ============================================================
# CouponUsage
# ============================================================


class CouponUsage(Base):
    __tablename__ = "coupon_usages"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    coupon_id: Mapped[int] = mapped_column(
        ForeignKey(
            "coupons.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String,
        nullable=False,
    )

    discount_amount: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    coupon: Mapped["Coupon"] = relationship(
        back_populates="usages",
    )

    user: Mapped["User"] = relationship(
        back_populates="coupon_usages",
    )

    __table_args__ = (
        Index(
            "coupon_usages_coupon_id_user_id_idx",
            "coupon_id",
            "user_id",
        ),
    )


# ============================================================
# Cart
# ============================================================


class Cart(Base):
    __tablename__ = "carts"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    cart_number: Mapped[str] = mapped_column(
        String,
        unique=True,
        nullable=False,
    )

    user_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
    )

    status: Mapped[CartStatus] = mapped_column(
        cart_status_enum,
        nullable=False,
        server_default="ACTIVE",
    )

    email: Mapped[str | None] = mapped_column(String)
    phone: Mapped[str | None] = mapped_column(String)

    total: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        server_default="0",
    )

    subtotal: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        server_default="0",
    )

    tax: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        server_default="0",
    )

    shipping_fee: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        server_default="0",
    )

    discount_amount: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        server_default="0",
    )

    wallet_used: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        server_default="0",
    )

    payment_method: Mapped[PaymentMethod | None] = mapped_column(
        payment_method_enum,
    )

    shipping_method: Mapped[ShippingMethod | None] = mapped_column(
        shipping_method_enum,
    )

    coupon_code: Mapped[str | None] = mapped_column(String)

    coupon_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "coupons.id",
            ondelete="SET NULL",
        ),
    )

    shipping_address_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "addresses.id",
            ondelete="SET NULL",
        ),
    )

    billing_address_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "addresses.id",
            ondelete="SET NULL",
        ),
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        onupdate=func.now(),
    )

    user: Mapped["User | None"] = relationship(
        back_populates="carts",
    )

    items: Mapped[list["CartItem"]] = relationship(
        back_populates="cart",
        cascade="all, delete-orphan",
    )

    order: Mapped["Order | None"] = relationship(
        back_populates="cart",
        uselist=False,
    )

    coupon: Mapped["Coupon | None"] = relationship(
        back_populates="carts",
    )

    __table_args__ = (
        Index("carts_cart_number_idx", "cart_number"),
        Index(
            "carts_user_id_status_idx",
            "user_id",
            "status",
        ),
    )


# ============================================================
# CartItem
# ============================================================


class CartItem(Base):
    __tablename__ = "cart_items"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    name: Mapped[str | None] = mapped_column(String)
    slug: Mapped[str | None] = mapped_column(String)

    cart_id: Mapped[int] = mapped_column(
        ForeignKey(
            "carts.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    cart_number: Mapped[str | None] = mapped_column(String)

    variant_id: Mapped[int] = mapped_column(
        ForeignKey(
            "product_variants.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    price: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    image: Mapped[str | None] = mapped_column(String)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    cart: Mapped["Cart"] = relationship(
        back_populates="items",
    )

    variant: Mapped["ProductVariant"] = relationship(
        back_populates="cart_items",
    )

    __table_args__ = (
        Index("cart_items_cart_number_idx", "cart_number"),
        Index("cart_items_variant_id_idx", "variant_id"),
        Index("cart_items_cart_id_idx", "cart_id"),
    )


# ============================================================
# Favorite
# ============================================================


class Favorite(Base):
    __tablename__ = "favorites"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey(
            "products.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        back_populates="favorites",
    )

    product: Mapped["Product"] = relationship(
        back_populates="favorites",
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "product_id",
        ),
        Index("favorites_user_id_idx", "user_id"),
        Index("favorites_created_at_idx", "created_at"),
        Index(
            "favorites_user_id_created_at_idx",
            "user_id",
            text("created_at DESC"),
        ),
    )


# ============================================================
# SharedCollection
# ============================================================


class SharedCollection(Base):
    __tablename__ = "shared_collections"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(Text)

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default="true",
    )

    view_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        server_default="0",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    products: Mapped[list["Product"]] = relationship(
        secondary=shared_collection_products,
        back_populates="shared_collections",
    )

    views: Mapped[list["SharedCollectionView"]] = relationship(
        back_populates="shared_collection",
        cascade="all, delete-orphan",
    )


# ============================================================
# SharedCollectionView
# ============================================================


class SharedCollectionView(Base):
    __tablename__ = "shared_collection_views"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True,
    )

    shared_collection_id: Mapped[int] = mapped_column(
        ForeignKey(
            "shared_collections.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    user_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
    )

    ip_address: Mapped[str | None] = mapped_column(String)
    user_agent: Mapped[str | None] = mapped_column(String)

    timestamp: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    shared_collection: Mapped["SharedCollection"] = relationship(
        back_populates="views",
    )

    user: Mapped["User | None"] = relationship()


# ============================================================
# WalletTransaction
# ============================================================


class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    amount: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    type: Mapped[WalletTransactionType] = mapped_column(
        wallet_transaction_type_enum,
        nullable=False,
    )

    reference_code: Mapped[str | None] = mapped_column(String)
    reference_id: Mapped[str | None] = mapped_column(String)

    created_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        server_default=func.now(),
    )

    user: Mapped["User"] = relationship(
        back_populates="wallet_transactions",
    )

    __table_args__ = (
        Index(
            "wallet_transactions_user_id_idx",
            "user_id",
        ),
        Index(
            "wallet_transactions_type_idx",
            "type",
        ),
        Index(
            "wallet_transactions_user_id_created_at_idx",
            "user_id",
            text("created_at DESC"),
        ),
    )