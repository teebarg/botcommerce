from typing import Optional
from pydantic import BaseModel, Field
from app.models.user import User
from datetime import datetime

class ReviewBase(BaseModel):
    id: int
    author: Optional[str]
    title: Optional[str]
    comment: str
    rating: int
    verified: bool
    user_id: int
    product_id: int

class Review(ReviewBase):
    user: Optional[User]
    created_at: datetime

class ReviewCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=50)
    author: str = Field(..., min_length=1, max_length=50)
    comment: str = Field(..., min_length=1, max_length=255)
    rating: int = Field(..., ge=1, le=5)
    product_id: int

class ReviewUpdate(BaseModel):
    comment: Optional[str] = ""
    rating: Optional[int] = 1
    verified: Optional[bool] = False

class Ratings(BaseModel):
    average: float
    count: int
    breakdown: dict[int, int]

class Reviews(BaseModel):
    reviews: list[Review]
    ratings: Ratings
    skip: int
    limit: int
    total_count: int
    total_pages: int
