from app.server import mcp

from app.clients.backend import backend


@mcp.tool()
async def search_products(
    query: str,
):
    """
    Search store products.
    """

    return await backend.search_products(query)