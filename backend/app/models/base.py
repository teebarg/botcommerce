from datetime import datetime
from pydantic import BaseModel, Field


class BM(BaseModel):
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    # Custom method for serialization (if needed)
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if isinstance(v, datetime) else v  # Ensure only datetime is encoded
        }
