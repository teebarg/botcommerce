from langchain.tools import tool
from pydantic import BaseModel

class RecommendationInput(BaseModel):
    user_id: int

@tool(args_schema=RecommendationInput)
def recommend_products(user_id: int) -> str:
    # Example placeholder for recommendation system
    return "Recommended products: Sneakers, T-Shirt, Jeans"