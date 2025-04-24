
from app.models.reviews import Reviews, ReviewCreate, ReviewUpdate
from fastapi import ( APIRouter, HTTPException, Depends, HTTPException, Query)

from app.core.deps import (
    CurrentUser,
    get_current_superuser,
)
from app.models.generic import Message
from app.prisma_client import prisma as db
from prisma.errors import PrismaError
from math import ceil
from prisma.models import Review

# Create a router for reviews
router = APIRouter()

@router.get("/")
# @cache(key="reviews")
async def index(
    product_id: int = None,
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> Reviews:
    """
    Retrieve reviews with Redis caching.
    """
    where_clause = None
    if product_id:
        where_clause = {
            "product_id": product_id
        }
    reviews = await db.review.find_many(
        where=where_clause,
        skip=(page - 1) * limit,
        take=limit,
        order={"created_at": "desc"},
    )
    total = await db.review.count(where=where_clause)
    return {
        "reviews":reviews,
        "page":page,
        "limit":limit,
        "total_pages":ceil(total/limit),
        "total_count":total,
    }



@router.get("/{id}")
# @cache(key="review", hash=False)
async def read(id: int) -> Review:
    """
    Get a specific review by id with Redis caching.
    """
    review = await db.review.find_unique(
        where={"id": id}
    )
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    return review

@router.post("/")
async def create(review: ReviewCreate, user: CurrentUser) -> Review:
    try:
        review = await db.review.create(
            data={
                **review.model_dump(),
                "user_id": user.id
            }
        )
        return review
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# @router.patch("/{id}", dependencies=[Depends(get_current_superuser)])
@router.patch("/{id}")
async def update(
    id: int,
    update_data: ReviewUpdate,
) -> Review:
    """
    Update a review and invalidate cache.
    """
    existing = await db.review.find_unique(
        where={"id": id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Review not found")

    try:
        update = await db.review.update(
            where={"id": id},
            data=update_data.model_dump(exclude_unset=True)
        )
        return update
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{id}", dependencies=[Depends(get_current_superuser)])
async def delete(id: int) -> Message:
    existing = await db.review.find_unique(
        where={"id": id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Review not found")

    try:
        await db.review.delete(
            where={"id": id}
        )
        return Message(message="Review deleted successfully")
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
