from langchain.tools import tool
from pydantic import BaseModel
from backend.app.db import search_products, get_similar_products  # Your DB functions

class ProductQueryInput(BaseModel):
    query: str
    limit: int = 5

class ProductInput(BaseModel):
    product_id: int

@tool(args_schema=ProductInput)
def get_product_details(product_id: int) -> str:
    # Replace with Prisma service layer
    product = {
        "id": product_id,
        "name": "Demo Sneakers",
        "price": 120.0,
        "stock": 10
    }
    return f"Product: {product['name']}, Price: {product['price']}, Stock: {product['stock']}"


@tool(args_schema=ProductQueryInput, description="Searches for products matching user query or suggests similar products")
def product_query(query: str, limit: int = 5) -> str:
    """
    Handles product inquiries and suggests similar products if none found.
    """
    # Try exact/primary search
    products = search_products(query=query, limit=limit)

    if products:
        product_names = [p.name for p in products]
        return f"Yes! We have: {', '.join(product_names)}"

    # Fallback: suggest similar products
    similar_products = get_similar_products(query=query, limit=limit)
    if similar_products:
        product_names = [p.name for p in similar_products]
        return f"Sorry, we don’t have '{query}', but you might like: {', '.join(product_names)}"

    # No products at all
    return f"Sorry, we currently don’t have any products matching '{query}'."