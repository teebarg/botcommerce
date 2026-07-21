from app.server import mcp

from app.clients.backend import backend


@mcp.tool()
async def get_order(
    order_number: str,
):
    """
    Retrieve an order.
    """

    return await backend.get_order(order_number)