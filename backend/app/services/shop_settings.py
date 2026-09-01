import json
from typing import Any

from prisma.models import ShopSettings

from app.services.cache import CacheService
from app.services.cdn import CdnService


class ShopSettingsService:
    CACHE_PREFIX = "shop-settings:"
    CACHE_EXPIRATION = 3600 * 24 * 30 # 1 week

    def __init__(self, db, cache_srv: CacheService, cdn_srv: CdnService):
        self.db = db
        self.cache_srv = cache_srv
        self.cdn_srv = cdn_srv

    def _cache_key(self, key: str) -> str:
        return f"{self.CACHE_PREFIX}{key}"

    async def get(self, key: str) -> str | None:
        """
        Get a setting by key, check Redis first, fallback to DB
        """
        cached = await self.cache_srv.redis.get(self._cache_key(key))
        if cached is not None:
            return cached

        setting = await self.db.shopsettings.find_first(where={"key": key})
        if setting:
            await self.cache_srv.redis.set(self._cache_key(key), setting.value, ex=self.CACHE_EXPIRATION)
            return setting.value
        return None

    async def set(self, key: str, value: str, type_: str = "SHOP_DETAIL"):
        """
        Upsert a setting and refresh Redis
        """
        setting = await self.db.shopsettings.upsert(
            where={"key": key},
            data={
                "create": {"key": key, "value": value, "type": type_},
                "update": {"value": value},
            },
        )
        await self.cache_srv.redis.set(self._cache_key(key), value, ex=self.CACHE_EXPIRATION)
        return setting

    async def get_all(self) -> list[ShopSettings]:
        return await self.db.shopsettings.find_many(order={"key": "asc"})

    async def get_by_id(self, id: int) -> ShopSettings | None:
        return await self.db.shopsettings.find_unique(where={"id": id})

    async def get_by_key(self, key: str) -> ShopSettings | None:
        return await self.db.shopsettings.find_unique(where={"key": key})

    async def create(self, key: str, value: str | None) -> ShopSettings:
        return await self.db.shopsettings.create(data={"key": key, "value": value})

    async def update(self, id: int, value: str | None) -> ShopSettings | None:
        return await self.db.shopsettings.update(
            where={"id": id}, data={"value": value}
        )

    async def invalidate(self) -> None:
        """Invalidate settings."""
        await self.cdn_srv.purge_cloudfare("/api/shop-settings/")
        await self.cache_srv.invalidate(tags=["shop-settings"])
