from sqlalchemy import select
from core.repositories.base_repository import BaseRepository

from core.db.models.product_image import ProductImage


class ProductImageRepository(BaseRepository[ProductImage]):
    model = ProductImage

    async def get_by_product(self, product_id: int) -> list[ProductImage]:
        result = await self.session.execute(
            select(ProductImage)
            .where(ProductImage.product_id == product_id)
            .order_by(ProductImage.order)
        )

        return list(result.scalars().all())
