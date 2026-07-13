from app.services.cache import CacheService
from app.services.cdn import CdnService

class DeliveryService:
    def __init__(self, cache_srv: CacheService, cdn_srv: CdnService):
        self.cache_srv = cache_srv
        self.cdn_srv = cdn_srv

    async def invalidate(self) -> None:
        """Invalidate deliveries."""
        await self.cdn_srv.purge_cloudfare("/api/delivery/")
        await self.cache_srv.invalidate("delivery")