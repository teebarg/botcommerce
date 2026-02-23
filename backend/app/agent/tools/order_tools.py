from langchain.tools import tool
from pydantic import BaseModel

class OrderInput(BaseModel):
    order_number: str

@tool(args_schema=OrderInput)
def check_order_status(order_number: str) -> str:
    # Replace with Prisma lookup
    return f"Order {order_number} is currently shipped."