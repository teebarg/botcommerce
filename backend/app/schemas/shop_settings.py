from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ShopSettingCreate(BaseModel):
    key: str
    value: str | None = None


class ShopSettingUpdate(BaseModel):
    value: str | None = None


class ShopSettingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    key: str
    value: str | None = None
    created_at: datetime
    updated_at: datetime
