
from fastapi import APIRouter, HTTPException

from app.api.routes.websocket import manager
from app.core.deps import CurrentUser
from app.models.activities import ActivityCreate, Activity
from app.models.generic import Message
from prisma.errors import PrismaError
from app.prisma_client import prisma as db

# Create a router for activities
router = APIRouter()


# Log a new activity
@router.post("/", response_model=Activity)
async def log_activity(user: CurrentUser, activity: ActivityCreate):
    try:
        new_activity = await db.activitylog.create(
            data={
                **activity.model_dump(),
                "user_id": user.id
            }
        )

        # Broadcast the new activity to all connected clients
        await manager.broadcast(
            id=str(user.id), data=new_activity.model_dump(mode="json"), type="activities"
        )

        return new_activity
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# Get recent activities for a user
@router.get("/")
# @cache(key="activities")
async def get_recent_activities(user: CurrentUser, limit: int = 10):
    activities = await db.activitylog.find_many(
        where={"user_id": user.id},
        take=limit
    )
    return activities


@router.delete("/{activity_id}", response_model=Message)
async def delete_activity(activity_id: int, user: CurrentUser):
    existing = await db.activitylog.find_unique(
        where={"id": activity_id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Activity not found")

    try:
        whereQuery = {"id": activity_id}
        if not user.role == "ADMIN":
            whereQuery.update({"user_id" : user.id})
        await db.activitylog.delete(where=whereQuery)
        return Message(message="Activity deleted successfully")
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
