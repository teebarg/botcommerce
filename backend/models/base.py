from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


class BaseModel(SQLModel):
    created_at: datetime = Field(default=datetime.now(timezone.utc))
    updated_at: datetime = Field(default=datetime.now(timezone.utc))
