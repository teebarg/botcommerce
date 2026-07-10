from typing import Callable, ParamSpec, TypeVar
import httpx
from fastapi import Response, Request
from app.core.logging import get_logger
from app.core.config import settings

logger = get_logger(__name__)

P = ParamSpec("P")
R = TypeVar("R")

_REFRESH_HEADER = "x-cache-refresh"
_CACHE_STATUS_HEADER = "X-Cache"
_CACHE_TTL_HEADER = "X-Cache-TTL"
_CACHE_CONTROL = "Cache-Control"

def set_public_cache(
    request: Request,
    ttl: int,
    swr: int = 3600,
    status: str = "HIT",
):
    set_cache_headers(
        request,
        status=status,
        ttl=ttl,
        cache_control=(
            f"public, max-age={ttl}, "
            f"stale-while-revalidate={swr}"
        ),
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

    if hasattr(request.state, "cache_status"):
        response.headers[_CACHE_STATUS_HEADER] = request.state.cache_status

    if hasattr(request.state, "cache_ttl"):
        response.headers[_CACHE_TTL_HEADER] = str(request.state.cache_ttl)

    if hasattr(request.state, "cache_control"):
        response.headers[_CACHE_CONTROL] = (request.state.cache_control)

    return response


async def purge_vercel_tags(*tags: str) -> None:
    if not tags:
        return
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.post(
                "https://api.vercel.com/v1/edge-cache/invalidate-by-tag",
                headers={"Authorization": f"Bearer {settings.VERCEL_API_TOKEN}"},
                json={"tags": list(tags)},
            )
            resp.raise_for_status()
    except httpx.HTTPError as e:
        logger.warning(f"Vercel purge failed for tags {tags}: {e}")