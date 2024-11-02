from sqlmodel import Field

# from pydantic import BaseModel as PDBModel, computed_field
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
