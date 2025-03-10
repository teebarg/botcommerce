from math import ceil
from typing import Any

from app.core.deps import (get_current_user)
from app.models.category import Categories, Category, CategoryCreate, CategoryUpdate
from app.models.message import Message
from app.core.db import PrismaDb
from app.core.utils import slugify
from fastapi import (APIRouter, Depends, HTTPException, Query)
from pydantic import BaseModel

from prisma.errors import PrismaError

# Create a router for categories
router = APIRouter()


class Search(BaseModel):
    results: list[Category]


@router.get("/", dependencies=[])
# @cache(key="categories")
async def index(
    db: PrismaDb,
    query: str = "",
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> Any:
    """
    Retrieve categories with Redis caching.
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
        skip=(page - 1) * limit,
        take=limit,
        order={"created_at": "desc"},
    )
    total = await db.category.count(where=where_clause)
    return {
        "categories":categories,
        "page":page,
        "limit":limit,
        "total_pages":ceil(total/limit),
        "total_count":total,
    }
    return Categories(
        categories=categories,
        page=page,
        limit=limit,
        total_pages=ceil(total/limit),
        total_count=total,
    )


@router.post("/")
async def create(*, db: PrismaDb, data: CategoryCreate) -> Category:
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
async def read(id: int, db: PrismaDb) -> Any:
    """
    Get a specific category by id with Redis caching.
    """
    category = await db.category.find_unique(
        where={"id": id}
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    return category


@router.get("/slug/{slug}")
# @cache(key="category", hash=False)
async def get_by_slug(slug: str, db: PrismaDb) -> Category:
    """
    Get a category by its slug.
    """
    category = await db.category.find_unique(
        where={"slug": slug}
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    return category


@router.patch("/{id}", dependencies=[Depends(get_current_user)])
async def update(
    *,
    db: PrismaDb,
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
async def delete(id: int, db: PrismaDb) -> Message:
    """
    Delete a category.
    """
    # Check if draft exists
    existing = await db.draft.find_unique(
        where={"id": id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")
    
    try:
        await db.draft.delete(
            where={"id": id}
        )
        return Message(message="Category deleted successfully")
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/autocomplete/")
async def autocomplete(
    db: PrismaDb,
    query: str = "",
) -> Any:
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
