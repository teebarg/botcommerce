from typing import Callable

import httpx
from app.core.config import settings
from app.core.logging import get_logger
from fastapi import Request, Response
from starlette.datastructures import MutableHeaders
from starlette.types import ASGIApp, Message, Receive, Scope, Send

logger = get_logger(__name__)

_REFRESH_HEADER = "x-cache-refresh"
_CACHE_CONTROL = "Cache-Control"
_CDN_CACHE_CONTROL = "CDN-Cache-Control"


def set_public_cache(
    request: Request,
    edge_ttl: int = 3600,
    swr: int = 86400,
    status: str = "HIT",
):
    request.state.cache_control = "no-store"
    request.state.cdn_cache_control = (
        f"public, max-age={edge_ttl}, stale-while-revalidate={swr}"
    )
    set_cache_headers(
        request,
        status=status,
        ttl=edge_ttl,
    )


# header helpers
def set_cache_headers(
    request: Request,
    *,
    status: str,
    ttl: int,
    cache_control: str | None = None,
) -> None:
    """
    Stash cache metadata in request.state so the response middleware
    (or a custom APIRoute class) can forward them as response headers.
    FastAPI doesn't let decorators set response headers directly, so we
    use request.state as a side-channel picked up by add_cache_headers().
    """
    request.state.cache_status = status
    request.state.cache_ttl = ttl

    if cache_control:
        request.state.cache_control = cache_control


# Response middleware helper
async def add_cache_headers(
    request: Request,
    call_next: Callable,
) -> Response:
    """
    Starlette middleware that promotes request.state cache metadata into
    actual HTTP response headers.

    Register in main.py:
        app.middleware("http")(add_cache_headers)
    """
    response: Response = await call_next(request)

    if hasattr(request.state, "cache_control"):
        response.headers[_CACHE_CONTROL] = request.state.cache_control

    if hasattr(request.state, "cdn_cache_control"):
        response.headers[_CDN_CACHE_CONTROL] = request.state.cdn_cache_control

    return response


class CacheHeadersMiddleware:
    """Handlers stash cache metadata on request.state (== scope["state"]); this copies it
        onto the response headers as the response starts.
    """

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_with_headers(message: Message) -> None:
            if message["type"] == "http.response.start":
                state = scope.get("state") or {}
                headers = MutableHeaders(scope=message)
                if "cache_control" in state:
                    headers[_CACHE_CONTROL] = state["cache_control"]
                if "cdn_cache_control" in state:
                    headers[_CDN_CACHE_CONTROL] = state["cdn_cache_control"]
            await send(message)

        await self.app(scope, receive, send_with_headers)


_PURGE_BATCH = 30


async def purge_cdn_urls(*paths: str) -> None:
    """Purge exact URLs from Cloudflare's edge cache, accounting for Vary: Origin."""
    origins: list[str] = [
        settings.FRONTEND_HOST,  # Frontend browser
        settings.DOMAIN,  # FastAPI docs / direct api
    ]

    if not settings.is_production:
        logger.debug("Skipping cloudfare purge locally.")
        return

    # Build the specific cache keys Cloudflare is tracking
    purge_files = []
    for p in dict.fromkeys(paths):
        url: str = f"{settings.server_host}{p}"
        for origin in origins:
            purge_files.append({"url": url, "headers": {"Origin": origin}})

    logger.debug(f"Purging {len(purge_files)} cache keys")

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            for i in range(0, len(purge_files), _PURGE_BATCH):
                batch = purge_files[i : i + _PURGE_BATCH]
                resp = await client.post(
                    f"https://api.cloudflare.com/client/v4/zones/{settings.CF_ZONE_ID}/purge_cache",
                    headers={"Authorization": f"Bearer {settings.CF_API_TOKEN}"},
                    json={"files": batch},  # objects with headers, not plain strings
                )
                resp.raise_for_status()
                data = resp.json()
                if not data.get("success"):
                    logger.warning(
                        f"Cloudflare API rejected purge request: {data.get('errors')}"
                    )
    except httpx.HTTPError as e:
        logger.warning(f"Cloudflare purge failed: {e}")
