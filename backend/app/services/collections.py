from typing import Optional
import asyncio
from app.core.logging import get_logger
from app.services.cache import CacheService
from app.services.cdn import CdnService

logger = get_logger(__name__)

class CollectionService:
    def __init__(self, cache_srv: CacheService, cdn_srv: CdnService):
        self.cache_srv = cache_srv
        self.cdn_srv = cdn_srv

    async def invalidate(self, slug: Optional[str] = None) -> None:
        """Invalidate collections."""
        await self.cdn_srv.purge_cloudfare("/api/collection/")
        if slug:
            await asyncio.gather(
                self.cdn_srv.purge_cloudfare(f"/api/collection/{slug}"),
                self.cdn_srv.purge_vercel(f"collection:{slug}"),
                return_exceptions=True
            )
            await self.cache_srv.invalidate(f"collection:{slug}", tags=["collections"])
        else:
            await self.cache_srv.invalidate(tags=["collections"])
