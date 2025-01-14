from typing import Optional
from sqlmodel import Field, SQLModel
from app.models.base import BaseModel


class SiteConfigBase(BaseModel):
    key: str
    value: str

class SiteConfigCreate(SiteConfigBase):
    pass

class SiteConfigUpdate(BaseModel):
    key: Optional[str] = None
    value: Optional[str] = None


class SiteConfig(SiteConfigBase, table=True):
    __tablename__ = "site_config"

    id: int | None = Field(default=None, primary_key=True)


class SiteConfigs(SQLModel):
    configs: list[SiteConfig]
    page: int
    limit: int
    total_count: int
    total_pages: int
