from pydantic import BaseModel as BM
from app.models.base import BaseModel


class ReviewBase(BaseModel):
    rating: int = 1
    comment: str
    verified: bool = False
    product_id: int


class ReviewCreate(BM):
    product_id: int
    rating: int = 10
    verified: bool = False
    comment: str


class ReviewUpdate(ReviewBase):
    pass
