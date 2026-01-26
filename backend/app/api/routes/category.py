from typing import Optional

from app.models.category import Category, CategoryCreate, CategoryUpdate, CategoryWithProducts
from app.models.generic import Message
from app.core.utils import slugify
from fastapi import (APIRouter, Depends, HTTPException, Request)
from pydantic import BaseModel
from app.core.storage import upload, delete_image
from app.models.generic import ImageUpload

from prisma.errors import PrismaError
from app.prisma_client import prisma as db
from app.services.redis import cache_response, invalidate_pattern
from app.core.deps import get_current_superuser
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()

class Search(BaseModel):
    results: list[Category]


@router.get("/home/products")
@cache_response(key_prefix="products", key="home")
async def get_home_categories_products(request: Request) -> list[CategoryWithProducts]:
    categories = await db.category.find_many(
        where={"is_active": True, "parent_id": None},
        order={"display_order": "asc"},
        include={"products": {"include": {"variants": True, "images": True}, "take": 6}},
        take=4
    )

    return categories

@router.get("/")
@cache_response(key_prefix="categories")
async def index(
    request: Request,
    query: str = "",
) -> Optional[list[Category]]:
    """
    Retrieve all categories.
    """
    where_clause = {"parent_id": None}
    if query:
        where_clause = {
            "OR": [
                {"name": {"contains": query, "mode": "insensitive"}},
                {"slug": {"contains": query, "mode": "insensitive"}}
            ]
        }
    return await db.category.find_many(
        where=where_clause,
        order={"display_order": "asc"},
    )

@router.post("/", dependencies=[Depends(get_current_superuser)])
async def create(*, data: CategoryCreate) -> Category:
    """
    Create new category.
    """
    try:
        category = await db.category.create(
            data={**data.model_dump(), "slug": slugify(data.name)}
        )
        await invalidate_pattern("categories")
        return category
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


class CategoryOrderUpdate(BaseModel):
    id: int
    display_order: int

class BulkOrderUpdate(BaseModel):
    categories: list[CategoryOrderUpdate]

@router.patch("/reorder", dependencies=[Depends(get_current_superuser)])
async def reorder_categories(order_data: BulkOrderUpdate):
    """Update display order for categories"""
    async with db.tx() as tx:
        try:
            for category_update in order_data.categories:
                category = await tx.category.find_unique(where={"id": category_update.id})
                if category:
                    await tx.category.update(
                        where={"id": category_update.id},
                        data={"display_order": category_update.display_order}
                    )

            await invalidate_pattern("categories")
            return {"message": "categories reordered successfully"}
        except Exception as e:
            logger.error(f"Failed to reorder categories: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{id}", dependencies=[Depends(get_current_superuser)])
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
            data=update_data.model_dump(exclude_unset=True)
        )
        await invalidate_pattern("categories")
        return update
    except PrismaError as e:
        logger.error(f"Failed to update category: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{id}", dependencies=[Depends(get_current_superuser)])
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
        await invalidate_pattern("categories")
        return Message(message="Category deleted successfully")
    except PrismaError as e:
        logger.error(f"Failed to delete category: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.patch("/{id}/image", dependencies=[Depends(get_current_superuser)])
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

        updated_category = await db.category.update(
            where={"id": id},
            data={"image": image_url}
        )
        await invalidate_pattern("categories")
        return updated_category

    except Exception as e:
        logger.error(f"Failed to upload image: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload image: {str(e)}"
        )


@router.delete("/{id}/image", dependencies=[Depends(get_current_superuser)])
async def delete_image(id: int) -> Message:
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
        file_path = category.image.split("/storage/v1/object/public/images/")[1]
        delete_image(bucket="images", file_path=file_path)

        await db.category.update(
            where={"id": id},
            data={"image": None}
        )
        await invalidate_pattern("categories")
        return Message(message="Category image deleted successfully")

    except Exception as e:
        logger.error(f"Failed to delete image: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete image: {str(e)}"
        )
