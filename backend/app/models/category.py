from sqlmodel import Field

# from pydantic import BaseModel as PDBModel, computed_field
from app.models.base import BaseModel as BM
from pydantic import BaseModel


class CategoryBase(BM):
    name: str = Field(index=True, unique=True)
    is_active: bool = True


# Properties to receive via API on creation
class CategoryCreate(CategoryBase):
    parent_id: int = None


# Properties to receive via API on update, all are optional
class Category(BaseModel):
    name: str
    slug: str
    is_active: bool = True
    parent_id: int = None


class CategoryUpdate(BaseModel):
    name: str
    is_active: bool = True


class Categories(BaseModel):
    categories: list[Category]
    page: int
    limit: int
    total_count: int
    total_pages: int


# class CategoryPublic(CategoryBase):
#     id: int
#     slug: str
#     parent_id: Optional[int]

#     @computed_field
#     @property
#     def parent(self) -> Optional["Category"]:
#         """
#         Computed property to get the parent category.
#         """
#         if not self.parent_id:
#             return None

#         # Fetch parent category from Supabase
#         response = db.table("categories")
#                   .select("*")
#                   .eq("id", self.parent_id).single().execute()
#         if not response.data:
#             return None

#         return Category(**response.data)
