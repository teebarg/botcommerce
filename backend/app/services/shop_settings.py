from app.prisma_client import prisma as db
from prisma.models import ShopSettings

from app.redis_client import redis_client

class ShopSettingsService:
    CACHE_PREFIX = "shop-settings:"
    CACHE_EXPIRATION = 3600 * 24 * 7 # 1 week

    def __init__(self):
        self.redis = redis_client

    def _cache_key(self, key: str) -> str:
        return f"{self.CACHE_PREFIX}{key}"

    async def get(self, key: str) -> str | None:
        """
        Get a setting by key, check Redis first, fallback to DB
        """
        cached = await self.redis.get(self._cache_key(key))
        if cached is not None:
            return cached

        setting = await db.shopsettings.find_first(where={"key": key})
        if setting:
            await self.redis.set(self._cache_key(key), setting.value, ex=self.CACHE_EXPIRATION)
            return setting.value
        return None

    async def set(self, key: str, value: str, type_: str = "SHOP_DETAIL") -> ShopSettings:
        """
        Upsert a setting and refresh Redis
        """
        setting = await db.shopsettings.upsert(
            where={"key": key},
            data={
                "create": {"key": key, "value": value, "type": type_},
                "update": {"value": value},
            },
        )
        await self.redis.set(self._cache_key(key), value, ex=self.CACHE_EXPIRATION)
        return setting

    async def invalidate(self, key: str):
        """
        Remove a setting from Redis
        """
        await self.redis.delete(self._cache_key(key))
