from app.server import mcp
import json
from app.backend import backend


@mcp.tool()
async def get_order(
    order_number: str,
):
    """
    Retrieve an order.
    """
    return await backend.get_order(order_number)
