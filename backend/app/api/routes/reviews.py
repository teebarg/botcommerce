
from app.models.reviews import PaginatedReviews, Review, ReviewCreate, ReviewUpdate, ReviewPublic
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
from sqlmodel import func, select

# Create a router for reviews
router = APIRouter()

@router.get("/")
@cache(key="reviews")
async def index(
    db: SessionDep,
    product_id: int = None,
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> PaginatedReviews:
    """
    Retrieve reviews with Redis caching.
    """
    try:
        count_statement = select(func.count()).select_from(Review)
        if product_id:
            count_statement = count_statement.where(Review.product_id == product_id)
        count = db.exec(count_statement).one()

        statement = select(Review).order_by(Review.created_at.desc())
        if product_id:
            statement = statement.where(Review.product_id == product_id)
        reviews = db.exec(statement.offset((page - 1) * limit).limit(limit)).all()

        pages = (count // limit) + (count % limit > 0)

        return PaginatedReviews(
            reviews=reviews,
            page=page,
            limit=limit,
            total_pages=pages,
            total_count=count,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"{e}") from e


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
    product = crud.product.get(db=db, id=review.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    try:
        review = crud.review.create(db=db, obj_in=review, user_id=user.id)
        # Invalidate cache
        cache.invalidate("reviews")
        cache.delete(f"product:{product.slug}")
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


# @router.patch("/{id}", dependencies=[Depends(get_current_superuser)])
@router.patch("/{id}")
async def update(
    *,
    db: SessionDep,
    cache: CacheService,
    id: int,
    update_data: ReviewUpdate,
) -> Review:
    """
    Update a review and invalidate cache.
    """
    review = crud.review.get(db=db, id=id)
    if not review:
        raise HTTPException(
            status_code=404,
            detail="Review not found",
        )
    try:
        review = crud.review.update(db=db, db_obj=review, obj_in=update_data)
        # Invalidate cache
        cache.delete(f"review:{id}")
        cache.invalidate("reviews")
        return review
    except IntegrityError as e:
        logger.error(f"Error updating review, {e.orig.pgerror}")
        raise HTTPException(status_code=422, detail=str(e.orig.pgerror)) from e
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=f"{e}") from e


@router.delete("/{id}", dependencies=[Depends(get_current_superuser)])
async def delete(id: int, db: SessionDep, cache: CacheService) -> Message:
    review = crud.review.get(db=db, id=id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    crud.review.remove(db=db, id=id)
    cache.delete(f"review:{id}")
    cache.invalidate("reviews")
    return Message(message="Review deleted successfully")
