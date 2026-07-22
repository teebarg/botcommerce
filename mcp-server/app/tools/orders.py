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

# async def get_recent_orders(limit: int = 10) -> str:
#     """
#     Retrieve recent store orders with customer and item details.

#     Args:
#         limit: Number of orders to fetch (default 10).
#     """
#     orders = await db.order.find_many(
#         take=limit,
#         order={"created_at": "desc"},
#         include={"user": True, "items": True}
#     )


#     order_list = [
#         {
#             "id": o.id,
#             "order_number": o.order_number,
#             "status": o.status,
#             "total": o.total,
#             "created_at": o.created_at.isoformat(),
#             "customer_email": o.user.email if o.user else "Guest",
#             "items_count": len(o.items)
#         }
#         for o in orders
#     ]
#     return json.dumps(order_list, indent=2)
