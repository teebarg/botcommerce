from typing import Optional

from sqlmodel import Field

from models.base import BaseModel


class ActivityBase(BaseModel):
    action_download_url: Optional[str] = None
    activity_type: str
    description: Optional[str] = None
    is_success: bool = Field(default=False)


class ActivityCreate(ActivityBase):
    pass


class ActivityUpdate(ActivityBase):
    pass
