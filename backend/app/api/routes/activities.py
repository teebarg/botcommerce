
from fastapi import APIRouter, HTTPException, Depends, Query, Request
from typing import List
from app.core.deps import CurrentUser, get_current_superuser
from app.models.generic import Message
from prisma.errors import PrismaError
from app.prisma_client import prisma as db
from app.services.redis import cache_response, invalidate_pattern
from app.services.websocket import manager
from app.models.activities import PaginatedActivities, Activity

router = APIRouter()

@router.get("/", dependencies=[Depends(get_current_superuser)])
@cache_response("activities")
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
@cache_response("activity", key=lambda request, user: user.id)
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
async def delete_activity(id: int, user: CurrentUser) -> Message:
    existing = await db.activitylog.find_unique(where={"id": id})
    if not existing:
        raise HTTPException(status_code=404, detail="Activity not found")

    try:
        whereQuery = {"id": id}
        if not user.role == "ADMIN":
            whereQuery.update({"user_id" : user.id})

        await db.activitylog.delete(where=whereQuery)
        await invalidate_pattern("activities")
        await manager.send_to_user(
            user_id=user.id,
            data={"key": f"activity:{user.id}"},
            message_type="invalidate",
        )
        return Message(message="Activity deleted successfully")
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
