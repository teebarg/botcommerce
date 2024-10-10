from sqlmodel import Session

from crud.base import CRUDBase
from models.activities import ActivityCreate, ActivityUpdate
from models.generic import ActivityLog


class CRUDActivity(CRUDBase[ActivityLog, ActivityCreate, ActivityUpdate]):
    def create(self, db: Session, activity_log: ActivityCreate, user_id: int) -> ActivityLog:
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
        return db.query(ActivityLog).filter(ActivityLog.user_id == user_id).order_by(ActivityLog.created_at.desc()).limit(limit).all()


activities = CRUDActivity(ActivityLog)
