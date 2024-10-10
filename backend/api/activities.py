from typing import List
from models.activities import ActivityCreate
from fastapi import (
    APIRouter,
    HTTPException,
)

import crud
from core.deps import (
    CurrentUser,
    SessionDep,
)
from core.logging import logger
from models.generic import ActivityLog
from api.websocket import manager

# Create a router for activities
router = APIRouter()


# Log a new activity
@router.post("/", response_model=ActivityLog)
def log_activity(db: SessionDep, user: CurrentUser, activity: ActivityCreate):
    new_activity = crud.activities.create(db=db, user_id=user.id, activity_log=activity)

    # Broadcast the new activity to all connected clients
    # activity_message = f"New {activity.activity_type} activity: {activity.description}"
    manager.broadcast(id=1,
        data=new_activity.model_dump(),
        type="activities")  # Send the update to all WebSocket clients

    return new_activity

# Get recent activities for a user
@router.get("/", response_model=List[ActivityLog])
def get_recent_activities(db: SessionDep, user: CurrentUser, limit: int = 10):
    activities = crud.activities.get_activity_logs_by_user(db=db, user_id=user.id, limit=limit)
    if not activities:
        raise HTTPException(status_code=404, detail="No activities found")
    return activities
