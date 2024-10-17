from sqlmodel import Field

from models.base import BaseModel


class CategoryBase(BaseModel):
    name: str = Field(index=True, unique=True)
    is_active: bool = True


# Properties to receive via API on creation
class CategoryCreate(CategoryBase):
    parent_id: int = None


# Properties to receive via API on update, all are optional
class CategoryUpdate(CategoryBase):
    pass
