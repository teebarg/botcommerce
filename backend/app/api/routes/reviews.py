
from app.models.reviews import Reviews, ReviewCreate, ReviewUpdate
from fastapi import ( APIRouter, HTTPException, Depends, HTTPException, Query, BackgroundTasks)

from app.core.deps import CurrentUser, get_current_superuser
from app.models.generic import Message
from app.prisma_client import prisma as db
from prisma.errors import PrismaError
from math import ceil
from prisma.models import Review
from app.services.product import reindex_product

router = APIRouter()

@router.get("/")
async def index(
    product_id: int = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, le=100),
    sort: str = Query(default="newest")
) -> Reviews:
    """
    Retrieve reviews with Redis caching.
    """
    where_clause = {"product_id": product_id} if product_id else {}
    sort_map = {
        "newest": {"created_at": "desc"},
        "oldest": {"created_at": "asc"},
        "highest": {"rating": "desc"},
        "lowest": {"rating": "asc"},
    }
    order_by = sort_map.get(sort, {"created_at": "desc"})
    reviews = await db.review.find_many(
        where=where_clause,
        skip=skip,
        take=limit,
        order=order_by,
    )
    total = await db.review.count(where=where_clause)

    if product_id:
        stats_query = """
            SELECT 
                ROUND(AVG(rating)::numeric, 2) as average_rating, 
                COUNT(*) as ratings_count
            FROM "reviews"
            WHERE product_id = $1
        """
        breakdown_query = """
            SELECT rating, COUNT(*) as count
            FROM "reviews"
            WHERE product_id = $1
            GROUP BY rating
        """
        stats_result = await db.query_raw(stats_query, product_id)
        breakdown_result = await db.query_raw(breakdown_query, product_id)
    else:
        stats_query = """
            SELECT 
                ROUND(AVG(rating)::numeric, 2) as average_rating, 
                COUNT(*) as ratings_count
            FROM "reviews"
        """
        breakdown_query = """
            SELECT rating, COUNT(*) as count
            FROM "reviews"
            GROUP BY rating
        """
        stats_result = await db.query_raw(stats_query)
        breakdown_result = await db.query_raw(breakdown_query)

    average_rating = float(stats_result[0]["average_rating"] or 0)
    ratings_count = stats_result[0]["ratings_count"]
    rating_counts = {int(r["rating"]): r["count"] for r in breakdown_result}
    rating_breakdown = {r: rating_counts.get(r, 0) for r in range(5, 0, -1)}

    return {
        "reviews": reviews,
        "skip": skip,
        "limit": limit,
        "total_pages": ceil(total / limit) if limit else 1,
        "total_count": total,
        "ratings": {
            "average": average_rating,
            "count": ratings_count,
            "breakdown": rating_breakdown
        }
    }

@router.post("/")
async def create(review: ReviewCreate, user: CurrentUser, background_tasks: BackgroundTasks) -> Review:
    existing_review = await db.review.find_first(
        where={"user_id": user.id, "product_id": review.product_id}
    )
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this product.")

    user_orders = await db.order.find_many(
        where={"user_id": user.id, "status": {"in": ["DELIVERED"]}},
        include={"order_items": {"include": {"variant": True}}}
    )
    has_purchased: bool = any(
        any(item.variant.product_id == review.product_id for item in order.order_items)
        for order in user_orders
    )
    if not has_purchased:
        raise HTTPException(status_code=403, detail="You can only review products you have purchased.")

    try:
        review = await db.review.create(
            data={
                **review.model_dump(),
                "user_id": user.id
            }
        )
        background_tasks.add_task(reindex_product, product_id=review.product_id)

        return review
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.patch("/{id}", dependencies=[Depends(get_current_superuser)])
async def update(
    id: int,
    update_data: ReviewUpdate,
) -> Review:
    """
    Update a review.
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
