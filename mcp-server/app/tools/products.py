from app.server import mcp
from app.backend import backend


@mcp.tool()
async def search_products(query: str):
    """
    Search store products.
    """
    return await backend.search_products(query)

@mcp.tool()
async def check_stock(product_slug: str) -> dict:
    """Check whether a specific product slug is in stock."""
    try:
        result = await backend.check_stock(product_slug)
        return {"slug": product_slug, "in_stock": result.get("active", False)}
    except Exception as e:
        return {"slug": product_slug, "in_stock": None, "error": str(e)}