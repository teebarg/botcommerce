import httpx

from core.config import settings
from core.logging import get_logger

logger = get_logger(__name__)

class CacheInvalidationService:
    async def purge_cloudflare(self, *paths: str) -> None:
        """Purge exact URLs from Cloudflare's edge cache, accounting for Vary: Origin."""
        origins: list[str] = [
            settings.FRONTEND_HOST,
            settings.DOMAIN
        ]
        
        # Build the specific cache keys Cloudflare is tracking
        purge_files = []
        for p in paths:
            url: str = f"{settings.DOMAIN}{p}"
            for origin in origins:
                purge_files.append({
                    "url": url,
                    "headers": {
                        "Origin": origin
                    }
                })
                
        logger.debug(f"Purging specific cache keys: {purge_files}")
        
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.post(
                    f"https://api.cloudflare.com/client/v4/zones/{settings.CF_ZONE_ID}/purge_cache",
                    headers={"Authorization": f"Bearer {settings.CF_API_TOKEN}"},
                    json={"files": purge_files},  # Passing objects with headers instead of strings
                )
                resp.raise_for_status()
                data = resp.json()
                if not data.get("success"):
                    logger.warning(f"Cloudflare API rejected purge request: {data.get('errors')}")
                else:
                    logger.debug("Cloudflare variant-specific purge accepted successfully!")
        except httpx.HTTPError as e:
            logger.warning(f"Cloudflare purge failed: {e}")