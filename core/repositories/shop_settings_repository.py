from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.db.models.base import ShopSettings


class ShopSettingsRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self) -> dict[str, str]:
        result = await self.session.execute(
            select(ShopSettings.key, ShopSettings.value)
            .where(ShopSettings.value.is_not(None))
        )

        return {
            key: value
            for key, value in result.all()
        }