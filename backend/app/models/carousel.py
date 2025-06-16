from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class CarouselBannerBase(BaseModel):
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    buttonText: Optional[str] = None
    link: Optional[str] = None
    order: int = 0
    is_active: bool = True

class CarouselBannerCreate(CarouselBannerBase):
    pass

class CarouselBannerUpdate(CarouselBannerBase):
    title: Optional[str] = None

class CarouselBanner(CarouselBannerBase):
    id: int
    image: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CarouselBanners(BaseModel):
    banners: List[CarouselBanner]
    page: int
    limit: int
    total_pages: int
    total_count: int 