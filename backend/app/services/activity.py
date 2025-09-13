from typing import Optional
from prisma.models import ActivityLog
from app.prisma_client import prisma as db
from app.services.websocket import manager
from app.core.logging import logger
from app.services.redis import invalidate_pattern

async def log_activity(
    user_id: int,
    activity_type: str,
    description: str,
    action_download_url: Optional[str] = None,
    is_success: bool = True
) -> Optional[ActivityLog]:
    """
    Log a user activity
    """
    try:
        activity = await db.activitylog.create(
            data={
                "user_id": user_id,
                "activity_type": activity_type,
                "description": description,
                "action_download_url": action_download_url,
                "is_success": is_success
            }
        )

        await invalidate_pattern("activities")
        await manager.send_to_user(
            user_id=user_id,
            data={"key": f"activity:{user_id}"},
            message_type="invalidate",
        )
        return activity
    except Exception as exc:
        logger.error(f"Handled error in log_activity: {exc}", exc_info=True)
        return None
