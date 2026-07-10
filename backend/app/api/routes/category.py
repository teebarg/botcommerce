from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from prisma.errors import PrismaError
from app.models.category import Category, CategoryCreate, CategoryUpdate, BulkOrderUpdate
from app.models.product import CategoryWithProducts
from app.models.generic import Message, ImageUpload
from app.core.utils import slugify
from app.prisma_client import prisma as db
from app.core.logging import get_logger
from app.core.permissions import require_admin
from app.core.dependencies.cache import CacheDep
from app.services.cache import cacheable
from app.core.dependencies.product import ProductDep
from app.core.dependencies.services import StorageDep

logger = get_logger(__name__)

router = APIRouter()

@router.get("/home/products", tags=["products"])
@cacheable(
    key_prefix="products:home",
    tags=["products", "catalog"],
    cdn_ttl=60,
    cdn_swr=3600,
)
async def get_home_categories_products(request: Request, product_srv: ProductDep) -> list[CategoryWithProducts]:
    categories = await db.category.find_many(
        where={"is_active": True},
        order={"display_order": "asc"},
        include={"products": {"include": {"variants": True, "images": True}, "take": 6, "orderBy": {"id": "desc"}}},
        take=4
    )

    for category in categories:
        category.products = [product_srv._prepare_product_data_for_indexing(product) for product in category.products]

    return categories

@router.get("/")
@cacheable(key_prefix="categories", key_builder=lambda query: query if query else "all", tags=["categories"], cdn_ttl=3600, cdn_swr=86400)
async def index(request: Request, query: str = "") -> Optional[list[Category]]:
    """
    Retrieve all categories.
    """
    where_clause = {}
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

@router.post("/", dependencies=[Depends(require_admin)])
async def create(data: CategoryCreate, cache: CacheDep) -> Category:
    """
    Create new category.
    """
    try:
        category = await db.category.create(
            data={**data.model_dump(), "slug": slugify(data.name)}
        )
        await cache.invalidate(tags=["categories"])
        return category
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.patch("/reorder", dependencies=[Depends(require_admin)])
async def reorder_categories(data: BulkOrderUpdate, cache: CacheDep) -> Message:
    """Update display order for categories"""
    async with db.tx() as tx:
        try:
            for category_update in data.categories:
                category = await tx.category.find_unique(where={"id": category_update.id})
                if category:
                    await tx.category.update(
                        where={"id": category_update.id},
                        data={"display_order": category_update.display_order}
                    )

            await cache.invalidate(tags=["categories"])
            return {"message": "categories reordered successfully"}
        except Exception as e:
            logger.error(f"Failed to reorder categories: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{id}", dependencies=[Depends(require_admin)])
async def update(
    id: int,
    update_data: CategoryUpdate,
    cache: CacheDep
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
        await cache.invalidate(tags=["categories"])
        return update
    except PrismaError as e:
        logger.error(f"Failed to update category: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{id}", dependencies=[Depends(require_admin)])
async def delete(id: int, cache: CacheDep) -> Message:
    """
    Delete a category.
    """
    existing = await db.category.find_unique(
        where={"id": id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")

    try:
        await db.category.delete(where={"id": id})
        await cache.invalidate(tags=["categories"])
        return Message(message="Category deleted successfully")
    except PrismaError as e:
        logger.error(f"Failed to delete category: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.patch("/{id}/image", dependencies=[Depends(require_admin)])
async def add_image(id: int, image_data: ImageUpload, cache: CacheDep, storage_srv: StorageDep) -> Category:
    """
    Add an image to a category.
    """
    category = await db.category.find_unique(
        where={"id": id}
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    try:
        image_url: str = storage_srv.upload(bucket="images", data=image_data)

        updated_category = await db.category.update(
            where={"id": id},
            data={"image": image_url}
        )
        await cache.invalidate(tags=["categories"])
        return updated_category

    except Exception as e:
        logger.error(f"Failed to upload image: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload image: {str(e)}"
        )


@router.delete("/{id}/image", dependencies=[Depends(require_admin)])
async def delete_image(id: int, cache: CacheDep, storage_srv: StorageDep) -> Message:
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
        storage_srv.delete_image(bucket="images", file_path=file_path)

        await db.category.update(
            where={"id": id},
            data={"image": None}
        )
        await cache.invalidate(tags=["categories"])
        return Message(message="Category image deleted successfully")

    except Exception as e:
        logger.error(f"Failed to delete image: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete image: {str(e)}"
        )
