from app.models.base import BM
from pydantic import BaseModel, Field


class ReviewBase(BM):
    comment: str = Field(..., min_length=1, description="Comment is required")
    rating: int = 1

class Review(ReviewBase):
    id: int


class ReviewCreate(ReviewBase):
    product_id: int


class ReviewUpdate(ReviewBase):
    verified: bool = False


class Reviews(BaseModel):
    reviews: list[Review]
    page: int
    limit: int
    total_count: int
    total_pages: int


class Search(BaseModel):
    results: list[Review]
