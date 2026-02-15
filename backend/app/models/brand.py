from typing import Optional
from pydantic import BaseModel


class BrandBase(BaseModel):
    name: str
    is_active: bool = True

class Brand(BrandBase):
    id: int
    slug: str

class BrandCreate(BrandBase):
    pass

class BrandUpdate(BaseModel):
    name: Optional[str]
    is_active: Optional[bool]
