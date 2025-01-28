
from app.models.reviews import ReviewCreate
from app.models.generic import PaginatedReviews, Review, ReviewPublic
from fastapi import ( APIRouter, HTTPException, Depends, HTTPException, Query)

from app.core import crud
from app.core.decorators import cache
from app.core.deps import (
    CacheService,
    CurrentUser,
    SessionDep,
    get_current_superuser,
)
from app.core.logging import logger
from app.models.message import Message
from sqlalchemy.exc import IntegrityError
from sqlmodel import func, or_, select

# Create a router for reviews
router = APIRouter()

@router.get("/")
@cache(key="reviews")
async def index(
    db: SessionDep,
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> PaginatedReviews:
    """
    Retrieve reviews with Redis caching.
    """
    query = {}
    filters = crud.review.build_query(query)

    count_statement = select(func.count()).select_from(Review)
    if filters:
        count_statement = count_statement.where(or_(*filters))
    count = db.exec(count_statement).one()

    reviews = crud.review.get_multi(
        db=db,
        filters=filters,
        limit=limit,
        offset=(page - 1) * limit,
    )

    pages = (count // limit) + (count % limit > 0)

    return PaginatedReviews(
        reviews=reviews,
        page=page,
        limit=limit,
        total_pages=pages,
        total_count=count,
    )


@router.get("/{id}")
@cache(key="review", hash=False)
async def read(id: int, db: SessionDep) -> ReviewPublic:
    """
    Get a specific review by id with Redis caching.
    """
    review = crud.review.get(db=db, id=id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    return review

@router.post("/")
async def create(review: ReviewCreate, db: SessionDep, user: CurrentUser, cache: CacheService) -> Review:
    try:
        review = crud.review.create(db=db, obj_in=review, user_id=user.id)
        # Invalidate cache
        cache.invalidate("reviews")
        return review
    except IntegrityError as e:
        logger.error(f"Error creating review, {e.orig.pgerror}")
        raise HTTPException(status_code=422, detail=str(e.orig.pgerror)) from e
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400,
            detail=e,
        ) from e


@router.delete("/{id}", dependencies=[Depends(get_current_superuser)])
async def delete(id: int, db: SessionDep, cache: CacheService) -> Message:
    review = crud.reviews.get(db=db, id=id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    crud.review.remove(db=db, id=id)
    cache.delete(f"review:{id}")
    cache.invalidate("reviews")
    return Message(message="Review deleted successfully")
