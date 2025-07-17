from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

class UserInteraction(BaseModel):
    user_id: int
    product_id: int
    interaction_type: str
    timestamp: Optional[datetime] = None

class RecommendationRequest(BaseModel):
    user_id: int
    num_recommendations: int = Field(default=10, le=50)
    recommendation_type: str = Field(default="hybrid", pattern="^(collaborative|content|hybrid)$")

class Product(BaseModel):
    id: int
    name: str
    categories: List[str]
    brand: Optional[str]
    features: List[str]
    ratings: float
    price: float


class ProductVariant(BaseModel):
    id: int
    sku: str
    status: str
    price: float
    old_price: float
    inventory: int
    size: Optional[str]
    color: Optional[str]

class SearchProduct(BaseModel):
    id: int
    name: str
    sku: Optional[str] = None
    slug: str
    description: str
    image: Optional[str] = None
    status: str
    ratings: float
    categories: List[str]
    collections: List[str]
    brand: Optional[str] = None
    tags: Optional[List[str]] = []
    images: Optional[List[str]] = []
    favorites: Optional[List[str]] = []
    variants: Optional[List[ProductVariant]] = []
    average_rating: Optional[float] = None
    review_count: Optional[int] = None
    average_rating: Optional[float] = None
    review_count: Optional[int] = None
    user_interactions: Any


class RecommendationResponse(BaseModel):
    user_id: int
    recommendations: List[SearchProduct]
    recommendation_type: str
    generated_at: datetime
