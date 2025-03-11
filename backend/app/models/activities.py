
from sqlmodel import Field, SQLModel

from app.models.base import BaseModel


class ActivityBase(BaseModel):
    action_download_url: str | None = None
    activity_type: str
    description: str | None = None
    is_success: bool = Field(default=False)


class ActivityCreate(ActivityBase):
    pass


class ActivityUpdate(ActivityBase):
    pass

class Activity(ActivityBase):
    id: int | None
    user_id: int

class Activities(SQLModel):
    activities: list[Activity]


class ActivityLog(ActivityBase, table=True):
    __tablename__ = "activity_logs"

    id: int | None = Field(default=None, primary_key=True, index=True)
    user_id: int = Field(foreign_key="user.id")
    activity_type: str | None = Field(
        index=True, max_length=255
    )  # E.g., "purchase", "viewed product", "profile updated"
    description: str | None = Field(max_length=255)
