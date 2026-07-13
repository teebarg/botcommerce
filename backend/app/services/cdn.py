from app.lib.cache import purge_cdn_urls, purge_vercel_tags

class CdnService:
    async def purge_cloudfare(self, *paths: str) -> None:
        await purge_cdn_urls(*paths)

    async def purge_vercel(self, *tags: str) -> None:
        await purge_vercel_tags(*tags)