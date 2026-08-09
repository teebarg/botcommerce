from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.db.base import Base


class ProductImage(Base):
    __tablename__ = "product_images"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    image: Mapped[str | None] = mapped_column(String(255), nullable=True)

    product_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "products.id",
            ondelete="CASCADE",
            onupdate="CASCADE",
        ),
        nullable=True,
    )

    order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # product = relationship("Product", back_populates="images")

    # __table_args__ = (
    #     Index("product_images_product_id_idx", "product_id"),
    #     Index("product_images_product_id_order_idx", "product_id", "order"),
    # )
    