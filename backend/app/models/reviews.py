from app.models.base import BM
from pydantic import BaseModel, Field
from typing import Optional

class ReviewBase(BM):
    comment: str = Field(..., min_length=1, description="Comment is required")
    rating: int = 1
    author: str
    title: str

class Review(ReviewBase):
    id: int
    verified: bool


class ReviewCreate(ReviewBase):
    product_id: int


class ReviewUpdate(BaseModel):
    comment: Optional[str] = ""
    rating: Optional[int] = 1
    verified: bool = False

class Ratings(BaseModel):
    average: float
    count: int
    breakdown: dict[int, int]


class Reviews(BaseModel):
    reviews: list[Review]
    skip: int
    limit: int
    total_count: int
    total_pages: int
    ratings: Ratings


class Search(BaseModel):
    results: list[Review]
