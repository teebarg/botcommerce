from app.server import mcp
from app.backend import backend

@mcp.tool()
async def check_order_status(order_number: str) -> dict:
    """Look up real-time status of a customer order by order number."""
    try:
        result = await backend.check_order_status(order_number)
        return {"order": result, "error": None}
    except Exception as e:
        return {"order": None, "error": str(e)}
