import asyncio

from sqlmodel import Session

from api.websocket import manager
from crud.base import CRUDBase
from models.activities import ActivityCreate, ActivityUpdate
from models.generic import ActivityLog


class CRUDActivity(CRUDBase[ActivityLog, ActivityCreate, ActivityUpdate]):
    def create(
        self, db: Session, activity_log: ActivityCreate, user_id: int
    ) -> ActivityLog:
        db_obj = ActivityLog.model_validate(
            activity_log,
            update={"user_id": user_id},
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    # Get recent activity logs for a specific user
    def get_activity_logs_by_user(self, db: Session, user_id: int, limit: int = 10):
        return (
            db.query(ActivityLog)
            .filter(ActivityLog.user_id == user_id)
            .order_by(ActivityLog.created_at.desc())
            .limit(limit)
            .all()
        )

    # Get recent activity logs for a specific user
    def create_product_export_activity(
        self, db: Session, user_id: int, download_url: str
    ):
        new_activity = self.create(
            db=db,
            user_id=user_id,
            activity_log=ActivityCreate(
                action_download_url=download_url,
                activity_type="product_export",
                description="File available. The file will only be stored for 24 hours",
                is_success=True,
            ),
        )

        # Broadcast the new activity to all connected clients
        asyncio.run(
            manager.broadcast(
                id="1", data=new_activity.model_dump(mode="json"), type="activity"
            )
        )

    def create_product_upload_activity(self, db: Session, user_id: int, filename: str):
        new_activity = self.create(
            db=db,
            user_id=user_id,
            activity_log=ActivityCreate(
                action_download_url=filename,
                activity_type="product_upload",
                description="Product Upload Successful",
                is_success=True,
            ),
        )

        # Broadcast the new activity to all connected clients
        asyncio.run(
            manager.broadcast(
                id="1", data=new_activity.model_dump(mode="json"), type="activity"
            )
        )


activities = CRUDActivity(ActivityLog)
