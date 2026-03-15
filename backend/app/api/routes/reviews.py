from app.models.reviews import Review, Reviews, ReviewCreate, ReviewUpdate
from fastapi import APIRouter, HTTPException, Depends, HTTPException, Query, BackgroundTasks
from app.core.deps import CurrentUser
from app.models.generic import Message
from app.prisma_client import prisma as db
from prisma.errors import PrismaError
from app.services.product import reindex_product
from app.core.permissions import require_admin
from base64 import b64encode, b64decode
import json
import asyncio

router = APIRouter()

@router.get("/")
async def index(
    product_id: int = None,
    cursor: str = Query(default=None, description="Pagination cursor from previous response"),
    limit: int = Query(default=20, le=100, ge=1),
    sort: str = Query(default="newest")
) -> Reviews:
    """
    Retrieve reviews with cursor-based pagination.
    Cursor encodes the last seen record's sort field + id for stable pagination.
    """
    SORT_MAP = {
        "newest":  ("created_at", "desc"),
        "oldest":  ("created_at", "asc"),
        "highest": ("rating",     "desc"),
        "lowest":  ("rating",     "asc"),
    }

    sort_field, sort_dir = SORT_MAP.get(sort, ("created_at", "desc"))
    where_clause = {"product_id": product_id} if product_id else {}
    cursor_filter = {}
    if cursor:
        try:
            payload = json.loads(b64decode(cursor).decode())
            last_value = payload["value"]
            last_id    = payload["id"]

            gt_lt = "lt" if sort_dir == "desc" else "gt"

            if sort_field == "created_at":
                from datetime import datetime, timezone
                last_value = datetime.fromisoformat(last_value)

            cursor_filter = {
                "OR": [
                    {sort_field: {gt_lt: last_value}},
                    {sort_field: {"equals": last_value}, "id": {gt_lt: last_id}},
                ]
            }
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid cursor")

    combined_where = {**where_clause, **cursor_filter} if cursor_filter else where_clause

    reviews = await db.review.find_many(
        where=combined_where,
        take=limit + 1,
        order=[{sort_field: sort_dir}, {"id": sort_dir}],
    )

    has_next = len(reviews) > limit
    reviews  = reviews[:limit]

    next_cursor = None
    if has_next and reviews:
        last = reviews[-1]
        raw_value = getattr(last, sort_field)

        if hasattr(raw_value, "isoformat"):
            raw_value = raw_value.isoformat()

        payload     = {"value": str(raw_value), "id": last.id}
        next_cursor = b64encode(json.dumps(payload).encode()).decode()

    if product_id:
        stats_query = """
            SELECT
                ROUND(AVG(rating)::numeric, 2) AS average_rating,
                COUNT(*)                        AS ratings_count
            FROM reviews
            WHERE product_id = $1
        """
        breakdown_query = """
            SELECT rating, COUNT(*) AS count
            FROM reviews
            WHERE product_id = $1
            GROUP BY rating
        """
        stats_result     = await db.query_raw(stats_query, product_id)
        breakdown_result = await db.query_raw(breakdown_query, product_id)
    else:
        stats_query = """
            SELECT
                ROUND(AVG(rating)::numeric, 2) AS average_rating,
                COUNT(*)                        AS ratings_count
            FROM reviews
        """
        breakdown_query = """
            SELECT rating, COUNT(*) AS count
            FROM reviews
            GROUP BY rating
        """
        stats_result, breakdown_result = await asyncio.gather(
            db.query_raw(stats_query),
            db.query_raw(breakdown_query),
        )

    average_rating   = float(stats_result[0]["average_rating"] or 0)
    ratings_count    = stats_result[0]["ratings_count"]
    rating_counts    = {int(r["rating"]): r["count"] for r in breakdown_result}
    rating_breakdown = {r: rating_counts.get(r, 0) for r in range(5, 0, -1)}

    return {
        "items":     reviews,
        "next_cursor": next_cursor,
        "limit":       limit,
        "ratings": {
            "average":   average_rating,
            "count":     ratings_count,
            "breakdown": rating_breakdown,
        },
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


@router.patch("/{id}", dependencies=[Depends(require_admin)])
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


@router.delete("/{id}", dependencies=[Depends(require_admin)])
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
