from typing import Optional
from app.lib.cache import purge_cdn_urls, purge_vercel_tags
from app.core.logging import get_logger
from app.services.cache import CacheService

logger = get_logger(__name__)

class CollectionService:
    def __init__(self, cache_srv: CacheService):
        self.cache_srv = cache_srv

    async def invalidate(self, slug: Optional[str] = None) -> None:
        """Invalidate collections."""
        if slug:
            await self.cache_srv.invalidate(f"collection:{slug}", tags=["collections"])
            await purge_vercel_tags(f"collection:{slug}")
            await purge_cdn_urls(f"/api/collection/{slug}")
        else:
            await self.cache_srv.invalidate(tags=["collections"])
        await purge_cdn_urls("/api/collection/")
