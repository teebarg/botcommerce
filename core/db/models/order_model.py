from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.db.base import Base
from core.db.models.base import (
    Cart,
    Coupon,
    OrderItem,
    OrderStatus,
    OrderTimeline,
    Payment,
    PaymentMethod,
    PaymentStatus,
    ShippingMethod,
    User,
    order_status_enum,
    payment_method_enum,
    payment_status_enum,
    shipping_method_enum,
)

if TYPE_CHECKING:
    from core.db.models.models import Address
    # from core.db.models.cart import Cart
    # from core.db.models.coupon import Coupon
    # from core.db.models.order_item import OrderItem
    # from core.db.models.order_timeline import OrderTimeline
    # from core.db.models.payment import Payment
    # from core.db.models.user import User


class Order(Base):
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
        nullable=True,
    )

    email: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    phone: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

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
        default=0,
        server_default="0",
    )

    wallet_used: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0,
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

    coupon_code: Mapped[str | None] = mapped_column(
        String,
        nullable=True,
    )

    coupon_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "coupons.id",
            ondelete="NO ACTION",
        ),
        nullable=True,
    )

    cart_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "carts.id",
            ondelete="NO ACTION",
        ),
        nullable=True,
        unique=True,
    )

    order_notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    invoice_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[user_id],
    )

    shipping_address: Mapped["Address | None"] = relationship(
        "Address",
        foreign_keys=[shipping_address_id],
    )

    coupon: Mapped["Coupon | None"] = relationship(
        "Coupon",
        foreign_keys=[coupon_id],
    )

    cart: Mapped["Cart | None"] = relationship(
        "Cart",
        foreign_keys=[cart_id],
    )

    order_items: Mapped[list["OrderItem"]] = relationship(
        "OrderItem",
        back_populates="order",
    )

    payment: Mapped["Payment | None"] = relationship(
        "Payment",
        back_populates="order",
        uselist=False,
    )

    order_timeline: Mapped[list["OrderTimeline"]] = relationship(
        "OrderTimeline",
        back_populates="order",
    )

    __table_args__ = (
        Index("orders_user_id_idx", "user_id"),
        Index("orders_status_idx", "status"),
        Index("orders_created_at_idx", "created_at"),
        Index("orders_payment_status_idx", "payment_status"),
        Index(
            "orders_user_id_created_at_idx",
            "user_id",
            created_at.desc(),
        ),
        Index(
            "orders_status_created_at_idx",
            "status",
            created_at.desc(),
        ),
        Index(
            "orders_payment_status_created_at_idx",
            "payment_status",
            created_at.desc(),
        ),
        Index(
            "orders_user_id_status_idx",
            "user_id",
            "status",
        ),
    )