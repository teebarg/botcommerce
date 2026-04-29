from typing import Optional
from app.prisma_client import prisma as db
from app.core.logging import logger
from app.services.redis import refresh_data
from app.models.activities import Activity

async def log_activity(
    user_id: int,
    activity_type: str,
    description: str,
    action_download_url: Optional[str] = None,
    is_success: bool = True
) -> Optional[Activity]:
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

        await refresh_data(patterns=["activities"], keys=[f"activity:{user_id}"])
        return activity
    except Exception as exc:
        logger.error(f"Handled error in log_activity: {exc}", exc_info=True)
        return None
