from starlette.requests import Request
from starlette.responses import PlainTextResponse, RedirectResponse
from starlette.middleware.cors import CORSMiddleware
from app.server import mcp

import app.tools.products
import app.tools.orders
import app.tools.catalog

@mcp.custom_route("/health", methods=["GET"])
async def health_check(request: Request) -> PlainTextResponse:
    return PlainTextResponse("OK")

@mcp.custom_route("/sse", methods=["GET", "POST", "OPTIONS"])
async def redirect_sse(request: Request):
    return RedirectResponse(url="/mcp")

app = mcp.http_app()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["mcp-session-id"],
)


if __name__ == "__main__":
    mcp.run(transport="streamable-http", host="0.0.0.0", port=9000, allowed_hosts=["*"])
