from pydantic import BaseModel, Field
from typing import Optional, Literal
from prisma.models import ShopSettings

class ShopSettingsBase(BaseModel):
    key: str = Field(..., min_length=1, max_length=255)
    value: Optional[str] = None
    type: Literal["FEATURE", "SHOP_DETAIL", "CUSTOM"] = "CUSTOM"
    category: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    is_public: bool = False

class ShopSettingsCreate(ShopSettingsBase):
    pass

class ShopSettingsUpdate(ShopSettingsBase):
    key: Optional[str] = None

# class ShopSettings(ShopSettingsBase):
#     id: int
#     created_at: str
#     updated_at: str

#     class Config:
#         from_attributes = True

class ShopSettingsList(BaseModel):
    settings: list[ShopSettings]
    page: int
    limit: int
    total_count: int
    total_pages: int