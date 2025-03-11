import asyncio

from sqlmodel import Session

from app.api.routes.websocket import manager
from app.core.cruds.base import BaseCRUD
from app.models.activities import ActivityLog, ActivityCreate, ActivityUpdate


class ActivityCRUD(BaseCRUD[ActivityLog, ActivityCreate, ActivityUpdate]):
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

        # Broadcast the new activity to all connected clients
        asyncio.run(
            manager.broadcast(
                id=str(user_id), data=db_obj.model_dump(mode="json"), type="activities"
            )
        )

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

    def create_product_export_activity(
        self, db: Session, user_id: int, download_url: str
    ):
        self.create(
            db=db,
            user_id=user_id,
            activity_log=ActivityCreate(
                action_download_url=download_url,
                activity_type="product_export",
                description="File available. The file will only be stored for 24 hours",
                is_success=True,
            ),
        )

    def create_product_upload_activity(self, db: Session, user_id: int, filename: str):
        self.create(
            db=db,
            user_id=user_id,
            activity_log=ActivityCreate(
                action_download_url=filename,
                activity_type="product_upload",
                description="Product Upload Successful",
                is_success=True,
            ),
        )
