from fastapi import APIRouter, HTTPException, Depends, Query, Request
from typing import List
from app.core.deps import CurrentUser
from app.models.generic import Message
from prisma.errors import PrismaError
from app.prisma_client import prisma as db
from app.models.activities import PaginatedActivities, Activity
from app.core.permissions import require_admin
from app.core.dependencies.cache import CacheDep
from app.services.cache import cacheable

router = APIRouter()

@router.get("/", dependencies=[Depends(require_admin)])
@cacheable(key_prefix="activities", tags=["activities"])
async def index(
    request: Request,
    cursor: int | None = None,
    limit: int = Query(default=20, le=100),
) -> PaginatedActivities:
    """
    Retrieve activities.
    """
    activities = await db.activitylog.find_many(
        skip=1 if cursor else 0,
        take=limit + 1,
        cursor={"id": cursor} if cursor else None,
        order={"created_at": "desc"},
    )
    items = activities[:limit]

    return {
        "items": items,
        "next_cursor": items[-1].id if len(activities) > limit else None,
        "limit": limit
    }

@router.get("/me")
@cacheable(key_prefix="activity", key_builder=lambda user: user.id)
async def get_recent_activities(request: Request, user: CurrentUser) -> List[Activity]:
    """
    Get current user's activities
    """
    return await db.activitylog.find_many(
        where={"user_id": user.id},
        skip=0,
        take=5,
        order={"created_at": "desc"},
    )


@router.delete("/{id}")
async def delete_activity(id: int, user: CurrentUser, cache: CacheDep) -> Message:
    existing = await db.activitylog.find_unique(where={"id": id})
    if not existing:
        raise HTTPException(status_code=404, detail="Activity not found")

    try:
        whereQuery = {"id": id}
        if not user.role == "ADMIN":
            whereQuery.update({"user_id" : user.id})

        await db.activitylog.delete(where=whereQuery)
        await cache.invalidate(f"activity:{user.id}", tags=["activities"])
        return Message(message="Activity deleted successfully")
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
