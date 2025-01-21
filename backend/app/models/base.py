from datetime import datetime

from sqlmodel import Field, SQLModel


class BaseModel(SQLModel):
    created_at: datetime = Field(default=datetime.now())
    updated_at: datetime = Field(default=datetime.now())

    # Custom method for serialization (if needed)
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if isinstance(v, datetime) else v  # Ensure only datetime is encoded
        }
