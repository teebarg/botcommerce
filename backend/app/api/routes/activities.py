from typing import List

from fastapi import APIRouter, HTTPException, status

from app import crud
from app.api.routes.websocket import manager
from app.core.deps import (
    CurrentUser,
    SessionDep,
)
from app.core.logging import logger
from app.models.activities import ActivityCreate
from app.models.generic import ActivityLog
from app.models.message import Message

# Create a router for activities
router = APIRouter()


# Log a new activity
@router.post("/", response_model=ActivityLog)
async def log_activity(db: SessionDep, user: CurrentUser, activity: ActivityCreate):
    new_activity = crud.activities.create(db=db, user_id=user.id, activity_log=activity)

    # Broadcast the new activity to all connected clients
    await manager.broadcast(
        id=str(user.id), data=new_activity.model_dump(mode="json"), type="activities"
    )

    return new_activity


# Get recent activities for a user
@router.get("/", response_model=List[ActivityLog])
async def get_recent_activities(db: SessionDep, user: CurrentUser, limit: int = 10):
    activities = crud.activities.get_activity_logs_by_user(
        db=db, user_id=user.id, limit=limit
    )
    return activities


@router.delete("/{activity_id}", response_model=Message)
async def delete_activity(activity_id: int, db: SessionDep, user: CurrentUser):
    activity = db.query(ActivityLog).filter(ActivityLog.id == activity_id).first()
    if activity is None:
        logger.error("Activity not found")
        raise HTTPException(status_code=404, detail="Activity not found")

    # Check if the current user is the owner of the activity or an admin
    if activity.user_id != user.id and not user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this activity",
        )

    db.delete(activity)
    db.commit()

    return {"message": "Activity deleted successfully"}
