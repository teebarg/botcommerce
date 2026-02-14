from pydantic import BaseModel
from typing import Optional
from app.models.user import User

class ReviewBase(BaseModel):
    comment: str
    rating: int
    author: str
    title: str

class Review(ReviewBase):
    id: int
    verified: bool
    user: Optional[User]


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
