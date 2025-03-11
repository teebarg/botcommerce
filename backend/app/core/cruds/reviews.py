from sqlmodel import Session

from app.core.cruds.base import BaseCRUD
from app.models.reviews import ReviewCreate, ReviewUpdate
from app.models.reviews import Review


class ReviewCRUD(BaseCRUD[Review, ReviewCreate, ReviewUpdate]):
    def create(self, db: Session, obj_in: ReviewCreate, user_id: int) -> Review:
        db_obj = Review.model_validate(
            obj_in,
            update={"user_id": user_id},
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
