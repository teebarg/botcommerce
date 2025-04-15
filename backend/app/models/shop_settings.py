from pydantic import BaseModel, Field
from typing import Optional, Literal
from prisma.models import ShopSettings

class ShopSettingsBase(BaseModel):
    key: str = Field(..., min_length=1, max_length=255)
    value: Optional[str] = None
    type: Literal["FEATURE", "SHOP_DETAIL", "CUSTOM"] = "CUSTOM"

class ShopSettingsCreate(ShopSettingsBase):
    pass

class ShopSettingsUpdate(ShopSettingsBase):
    key: Optional[str] = None

class ShopSettingsList(BaseModel):
    settings: list[ShopSettings]
    page: int
    limit: int
    total_count: int
    total_pages: int