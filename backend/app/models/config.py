from app.models.base import BM
from pydantic import BaseModel, Field


class SiteConfigBase(BM):
    key: str = Field(..., min_length=1, description="Key is required")
    value: str = Field(..., min_length=1, description="Value is required")

class SiteConfig(SiteConfigBase):
    id: int


class SiteConfigCreate(SiteConfigBase):
    pass


class SiteConfigUpdate(SiteConfigBase):
    pass


class SiteConfigs(BaseModel):
    configs: list[SiteConfig]
    skip: int
    limit: int
    total_count: int
    total_pages: int
