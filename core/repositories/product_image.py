from typing import Any

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from core.models.product_image import ProductImage


class ProductImageRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_product(self, product_id: int) -> list[ProductImage]:
        result = await self.session.execute(
            select(ProductImage)
            .where(ProductImage.product_id == product_id)
            .order_by(ProductImage.order)
        )

        return list(result.scalars().all())

    
    async def update(
        self,
        image_id: int,
        data: dict[str, Any],
    ) -> ProductImage | None:
        stmt = (
            update(ProductImage)
            .where(ProductImage.id == image_id)
            .values(**data)
            .returning(ProductImage)
        )

        result = await self.session.execute(stmt)

        return result.scalar_one_or_none()