from typing import Any, Optional

from app.models.category import Category, CategoryCreate, CategoryUpdate
from app.models.generic import Message
from app.core.utils import slugify
from fastapi import (APIRouter, Depends, HTTPException, Request)
from pydantic import BaseModel
from app.core.storage import upload, delete_image
from app.models.generic import ImageUpload

from prisma.errors import PrismaError
from app.prisma_client import prisma as db
from app.services.redis import cache_response
from app.core.deps import get_current_superuser, RedisClient
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()

class Search(BaseModel):
    results: list[Category]

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
        include={"subcategories": True},
    )

@router.post("/")
async def create(*, data: CategoryCreate, cache: RedisClient) -> Category:
    """
    Create new category.
    """
    try:
        category = await db.category.create(
            data={**data.model_dump(), "slug": slugify(data.name)}
        )
        await cache.invalidate_list_cache("categories")
        return category
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{id}")
@cache_response(key_prefix="category", key=lambda request, id: id)
async def read(id: int, request: Request) -> Any:
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
@cache_response(key_prefix="category", key=lambda request, slug: slug)
async def get_by_slug(slug: str, request: Request) -> Category:
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


class CategoryOrderUpdate(BaseModel):
    id: int
    display_order: int

class BulkOrderUpdate(BaseModel):
    categories: list[CategoryOrderUpdate]

@router.patch("/reorder")
async def reorder_categories(order_data: BulkOrderUpdate, cache: RedisClient):
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

            await cache.invalidate_list_cache("categories")
            await cache.invalidate_list_cache("category")
            return {"message": "categories reordered successfully"}
        except Exception as e:
            logger.error(f"Failed to reorder categories: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{id}", dependencies=[Depends(get_current_superuser)])
async def update(
    *,
    id: int,
    update_data: CategoryUpdate,
    cache: RedisClient,
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
        await cache.invalidate_list_cache("categories")
        await cache.bust_tag(f"category:{id}")
        await cache.bust_tag(f"category:{update.slug}")
        return update
    except PrismaError as e:
        logger.error(f"Failed to update category: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{id}")
async def delete(id: int, cache: RedisClient) -> Message:
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
        await cache.invalidate_list_cache("categories")
        await cache.bust_tag(f"category:{id}")
        await cache.bust_tag(f"category:{existing.slug}")
        return Message(message="Category deleted successfully")
    except PrismaError as e:
        logger.error(f"Failed to delete category: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/autocomplete/")
@cache_response(key_prefix="categories")
async def autocomplete(request: Request, query: str = "") -> Any:
    """
    Retrieve categories for autocomplete.
    """
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
        order={"display_order": "asc"},
    )
    return Search(results=categories)


@router.patch("/{id}/image")
async def add_image(id: int, image_data: ImageUpload, cache: RedisClient) -> Category:
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
        await cache.invalidate_list_cache("categories")
        await cache.bust_tag(f"category:{id}")
        await cache.bust_tag(f"category:{updated_category.slug}")
        return updated_category

    except Exception as e:
        logger.error(f"Failed to upload image: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload image: {str(e)}"
        )


@router.delete("/{id}/image", dependencies=[Depends(get_current_superuser)])
async def delete_image(
    id: int,
    cache: RedisClient
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
        file_path = category.image.split("/storage/v1/object/public/images/")[1]
        delete_image(bucket="images", file_path=file_path)

        await db.category.update(
            where={"id": id},
            data={"image": None}
        )
        await cache.invalidate_list_cache("categories")
        await cache.bust_tag(f"category:{id}")
        await cache.bust_tag(f"category:{category.slug}")
        return Message(message="Category image deleted successfully")

    except Exception as e:
        logger.error(f"Failed to delete image: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete image: {str(e)}"
        )
