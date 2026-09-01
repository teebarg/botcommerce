from app.lib.cache import purge_cdn_urls


class CdnService:
    async def purge_cloudfare(self, *paths: str) -> None:
        await purge_cdn_urls(*paths)
