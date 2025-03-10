
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
