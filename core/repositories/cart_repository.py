from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.db.models.base import Cart, CartItem, Product, ProductVariant
from core.repositories.base_repository import BaseRepository


class CartRepository(BaseRepository[Cart]):
    model = Cart

    async def get_with_items(self, cart_id: int) -> Cart | None:
        return await self.get_by_id(
            cart_id,
            options=[
                selectinload(Cart.user),
                selectinload(Cart.items)
                .selectinload(CartItem.variant)
                .selectinload(ProductVariant.product)
                .selectinload(Product.images),
            ],
        )
