from pydantic import BaseModel
from datetime import datetime

class Activity(BaseModel):
    id: int
    user_id: int
    action_download_url: str | None = None
    activity_type: str
    description: str | None = None
    is_success: bool
    created_at: datetime

class PaginatedActivities(BaseModel):
    items: list[Activity]
    next_cursor: int | None
    limit: int
