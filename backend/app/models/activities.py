from app.models.base import BM
from pydantic import BaseModel, Field


class ActivityBase(BM):
    action_download_url: str = Field(..., min_length=1, description="Url is required")
    activity_type: str
    description: str | None = None
    is_success: bool = Field(default=False)

class Activity(ActivityBase):
    id: int
    user_id: int


class ActivityCreate(ActivityBase):
    pass


class ActivityUpdate(ActivityBase):
    pass


class Activities(BaseModel):
    activities: list[Activity]


class Search(BaseModel):
    results: list[Activity]
