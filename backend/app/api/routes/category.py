from math import ceil
from typing import Any, Optional

from app.core.deps import (get_current_user)
from app.models.category import Categories, Category, CategoryCreate, CategoryUpdate
from app.models.generic import Message
from app.core.utils import slugify
from fastapi import (APIRouter, Depends, HTTPException, Query, Request)
from pydantic import BaseModel
from app.core.storage import upload, delete_Image
from app.core.decorators import cache

from prisma.errors import PrismaError
from app.prisma_client import prisma as db

# Create a router for categories
router = APIRouter()


class Search(BaseModel):
    results: list[Category]

@router.get("/all")
async def all_categories(
    query: str = "",
) -> Optional[list[Category]]:
    """
    Retrieve all categories.
    """
    # Define the where clause based on query parameter
    where_clause = {"parent_id": None}
    if query:
        where_clause = {
            "OR": [
                {"name": {"contains": query, "mode": "insensitive"}},
                {"slug": {"contains": query, "mode": "insensitive"}}
            ]
        }
    return await db.category.find_many(where=where_clause)


@router.get("/", dependencies=[])
# @cache(key="categories")
async def index(
    query: str = "",
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> Categories:
    """
    Retrieve categories with Redis caching.
    """
    # Define the where clause based on query parameter
    where_clause = {"parent_id": None}
    if query:
        where_clause = {
            "OR": [
                {"name": {"contains": query, "mode": "insensitive"}},
                {"slug": {"contains": query, "mode": "insensitive"}}
            ]
        }
    categories = await db.category.find_many(
        where=where_clause,
        skip=(page - 1) * limit,
        take=limit,
        order={"created_at": "desc"},
        include={"subcategories": True}
    )
    total = await db.category.count(where=where_clause)
    return {
        "categories":categories,
        "page":page,
        "limit":limit,
        "total_pages":ceil(total/limit),
        "total_count":total,
    }


@router.post("/")
async def create(*, data: CategoryCreate) -> Category:
    """
    Create new category.
    """
    try:
        category = await db.category.create(
            data={
                "name": data.name,
                "slug": slugify(data.name),
                "parent_id": data.parent_id
            }
        )
        return category
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{id}")
# @cache(key="category", hash=False)
async def read(id: int) -> Any:
    """
    Get a specific category by id with Redis caching.
    """
    category = await db.category.find_unique(
        where={"id": id},
        include={"subcategories": True}
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    return category


@router.get("/slug/{slug}")
# @cache(key="category", hash=False)
async def get_by_slug(slug: str) -> Category:
    """
    Get a category by its slug.
    """
    category = await db.category.find_unique(
        where={"slug": slug},
        include={"subcategories": True}
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    return category


@router.patch("/{id}", dependencies=[Depends(get_current_user)])
async def update(
    *,
    id: int,
    update_data: CategoryUpdate,
) -> Category:
    """
    Update a category and invalidate cache.
    """
    existing = await db.category.find_unique(
        where={"id": id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")

    try:
        update = await db.category.update(
            where={"id": id},
            data=update_data.model_dump()
        )
        return update
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{id}")
async def delete(id: int) -> Message:
    """
    Delete a category.
    """
    existing = await db.category.find_unique(
        where={"id": id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")

    try:
        await db.category.delete(
            where={"id": id}
        )
        return Message(message="Category deleted successfully")
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/autocomplete/")
async def autocomplete(query: str = "") -> Any:
    """
    Retrieve categories for autocomplete.
    """
    # Define the where clause based on query parameter
    where_clause = None
    if query:
        where_clause = {
            "OR": [
                {"name": {"contains": query, "mode": "insensitive"}},
                {"slug": {"contains": query, "mode": "insensitive"}}
            ]
        }
    categories = await db.category.find_many(
        where=where_clause,
        order={"created_at": "desc"},
    )
    return Search(results=categories)


class ImageUpload(BaseModel):
    file: str  # Base64 encoded file
    file_name: str
    content_type: str


@router.patch("/{id}/image")
async def add_image(id: int, image_data: ImageUpload) -> Category:
    """
    Add an image to a category.
    """
    category = await db.category.find_unique(
        where={"id": id}
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    try:
        image_url = upload(bucket="images", data=image_data)

        # Update category with new image URL
        updated_category = await db.category.update(
            where={"id": id},
            data={"image": image_url}
        )
        return updated_category

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload image: {str(e)}"
        )


@router.delete("/{id}/image")
async def delete_image(
    id: int,
    current_user = Depends(get_current_user)
) -> Message:
    """
    Delete the image of a category.
    """
    category = await db.category.find_unique(
        where={"id": id}
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    if not category.image:
        raise HTTPException(status_code=404, detail="Category has no image")

    try:
        # Extract file path from URL
        file_path = category.image.split("/storage/v1/object/public/images/")[1]
        delete_Image(bucket="images", file_path=file_path)

        # Update category to remove image URL
        await db.category.update(
            where={"id": id},
            data={"image": None}
        )
        return Message(message="Category image deleted successfully")

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete image: {str(e)}"
        )
