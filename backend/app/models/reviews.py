from pydantic import BaseModel as BM
from app.models.base import BaseModel


class ReviewBase(BaseModel):
    rating: int = 1
    comment: str
    verified: bool = False
    product_id: int

class Review(BaseModel):
    pass


class ReviewCreate(BM):
    product_id: int
    rating: int = 1
    verified: bool = False
    comment: str


class ReviewUpdate(BM):
    rating: int = 1
    verified: bool = False
    comment: str

class ReviewPublic(ReviewBase):
    id: int


class Reviews(BaseModel):
    reviews: list[ReviewPublic]
    page: int
    limit: int
    total_count: int
    total_pages: int


class PaginatedReviews(Reviews):
    pass
