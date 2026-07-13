from app.core.logging import get_logger
from app.services.cache import CacheService
from app.services.cdn import CdnService

logger = get_logger(__name__)

class BankDetailsService:
    def __init__(self, cache_srv: CacheService, cdn_srv: CdnService):
        self.cache_srv = cache_srv
        self.cdn_srv = cdn_srv

    async def invalidate(self) -> None:
        """Invalidate bank details."""
        await self.cdn_srv.purge_cloudfare("/api/bank-details/")
        await self.cache_srv.invalidate(tags=["bank-details"])
