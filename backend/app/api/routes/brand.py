from typing import Optional
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from app.core.deps import get_current_user
from app.models.brand import (
    BrandCreate,
    Brands,
    BrandUpdate,
)
from app.models.generic import Message
from app.prisma_client import prisma as db
from math import ceil
from app.core.utils import slugify
from prisma.errors import PrismaError
from prisma.models import Brand

# Create a router for brands
router = APIRouter()

@router.get("/all")
async def all_brands(query: str = "") -> Optional[list[Brand]]:
    """
    Retrieve brands with Redis caching.
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
    return await db.brand.find_many(where=where_clause, order={"created_at": "desc"})


@router.get("/")
async def index(
    query: str = "",
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> Brands:
    """
    Retrieve brands with Redis caching.
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
    brands = await db.brand.find_many(
        where=where_clause,
        skip=(page - 1) * limit,
        take=limit,
        order={"created_at": "desc"},
    )
    total = await db.brand.count(where=where_clause)
    return {
        "brands":brands,
        "page":page,
        "limit":limit,
        "total_pages":ceil(total/limit),
        "total_count":total,
    }


@router.post("/")
async def create(*, create_data: BrandCreate) -> Brand:
    """
    Create new brand.
    """
    try:
        brand = await db.brand.create(
            data={
                **create_data.model_dump(),
                "slug": slugify(create_data.name)
            }
        )
        return brand
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{id}")
async def read(id: int):
    """
    Get a specific brand by id with Redis caching.
    """
    brand = await db.brand.find_unique(
        where={"id": id}
    )
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    return brand


@router.get("/slug/{slug}")
async def get_by_slug(slug: str) -> Brand:
    """
    Get a brand by its slug.
    """
    brand = await db.brand.find_unique(
        where={"slug": slug}
    )
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    return brand


@router.patch(
    "/{id}",
    dependencies=[Depends(get_current_user)]
)
async def update(
    *,
    id: int,
    update_data: BrandUpdate,
) -> Brand:
    """
    Update a brand.
    """
    existing = await db.brand.find_unique(
        where={"id": id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Brand not found")

    try:
        update = await db.brand.update(
            where={"id": id},
            data={
                **update_data.model_dump(),
                "slug": slugify(update_data.name)
            }
        )
        return update
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{id}", dependencies=[Depends(get_current_user)])
async def delete(id: int) -> Message:
    """
    Delete a brand.
    """
    existing = await db.brand.find_unique(
        where={"id": id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Brand not found")

    try:
        await db.brand.delete(
            where={"id": id}
        )
        return Message(message="Brand deleted successfully")
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
