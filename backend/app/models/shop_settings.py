from pydantic import BaseModel, Field
from typing import Optional, Literal

class ShopSettingsBase(BaseModel):
    key: str = Field(..., min_length=1, max_length=255)
    value: Optional[str] = None
    type: Literal["FEATURE", "SHOP_DETAIL", "CUSTOM"] = "CUSTOM"

class ShopSettingsCreate(ShopSettingsBase):
    pass

class ShopSettingsUpdate(ShopSettingsBase):
    key: Optional[str] = None
