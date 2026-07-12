from app.lib.cache import purge_cdn_urls
from app.core.logging import get_logger
from app.services.cache import CacheService

logger = get_logger(__name__)

class BankDetailsService:
    def __init__(self, cache_srv: CacheService):
        self.cache_srv = cache_srv

    async def invalidate(self) -> None:
        """Invalidate bank details."""
        await self.cache_srv.invalidate(tags=["bank-details"])
        await purge_cdn_urls("/api/bank-details/")
