
from fastapi import APIRouter, HTTPException, Depends, Query, Request
from typing import List
from math import ceil

from app.core.deps import CurrentUser, get_current_superuser
from app.models.generic import Message
from prisma.errors import PrismaError
from app.prisma_client import prisma as db
from prisma.models import ActivityLog
from app.services.redis import cache_response, invalidate_list, bust

router = APIRouter()

@router.get("/", dependencies=[Depends(get_current_superuser)])
@cache_response("activities")
async def index(
    request: Request,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, le=100),
):
    """
    Retrieve activities.
    """
    activities = await db.activitylog.find_many(
        skip=skip,
        take=limit,
        order={"created_at": "desc"},
    )
    total = await db.activitylog.count()
    return {
        "activities": activities,
        "skip": skip,
        "limit":limit,
        "total_pages":ceil(total/limit),
        "total_count":total,
    }

@router.get("/me", response_model=List[ActivityLog])
@cache_response("activity", key=lambda request, user: user.id)
async def get_recent_activities(request: Request, user: CurrentUser):
    """
    Get current user's activities
    """
    return await db.activitylog.find_many(
        where={"user_id": user.id},
        skip=0,
        take=5,
        order={"created_at": "desc"},
    )


@router.delete("/{id}", response_model=Message)
async def delete_activity(id: int, user: CurrentUser):
    existing = await db.activitylog.find_unique(where={"id": id})
    if not existing:
        raise HTTPException(status_code=404, detail="Activity not found")

    try:
        whereQuery = {"id": id}
        if not user.role == "ADMIN":
            whereQuery.update({"user_id" : user.id})
        await db.activitylog.delete(where=whereQuery)
        await invalidate_list("activities")
        await bust(f"activity:{user.id}")
        return Message(message="Activity deleted successfully")
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
