from typing import Optional
from prisma.models import ActivityLog
from app.prisma_client import prisma as db
from app.services.websocket import manager
from fastapi.encoders import jsonable_encoder


async def log_activity(
    user_id: int,
    activity_type: str,
    description: str,
    action_download_url: Optional[str] = None,
    is_success: bool = True
) -> ActivityLog:
    """
    Log a user activity
    """
    activity = await db.activitylog.create(
        data={
            "user_id": user_id,
            "activity_type": activity_type,
            "description": description,
            "action_download_url": action_download_url,
            "is_success": is_success
        }
    )
    # broadcast
    await manager.send_to_user(
        user_id=user_id,
        data=jsonable_encoder(activity),
        message_type="activities",
    )
    return activity
