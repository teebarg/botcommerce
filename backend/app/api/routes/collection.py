from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query
)


from app.core.deps import (
    CurrentUser,
    get_current_user,
)
from app.core.logging import logger
from app.models.collection import (
    CollectionCreate,
    Collection,
    Collections,
    CollectionUpdate,
    Search,
)
from app.models.generic import Message
from app.services.export import export
from app.prisma_client import prisma as db
from app.core.utils import slugify
from prisma.errors import PrismaError
from typing import Optional
from math import ceil

# Create a router for collections
router = APIRouter()

@router.get("/all")
async def all_collections(query: str = "") -> Optional[list[Collection]]:
    """
    Retrieve collections with Redis caching.
    """
    where_clause = None
    if query:
        where_clause = {
            "OR": [
                {"name": {"contains": query, "mode": "insensitive"}},
                {"slug": {"contains": query, "mode": "insensitive"}}
            ]
        }
    return await db.collection.find_many(where=where_clause, order={"created_at": "desc"})


@router.get("/")
# @cache(key="collections")
async def index(
    query: str = "",
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> Collections:
    """
    Retrieve collections with Redis caching.
    """
    where_clause = None
    if query:
        where_clause = {
            "OR": [
                {"name": {"contains": query, "mode": "insensitive"}},
                {"slug": {"contains": query, "mode": "insensitive"}}
            ]
        }
    collections = await db.collection.find_many(
        where=where_clause,
        skip=(page - 1) * limit,
        take=limit,
        order={"created_at": "desc"},
    )
    total = await db.collection.count(where=where_clause)
    return {
        "collections":collections,
        "page":page,
        "limit":limit,
        "total_pages":ceil(total/limit),
        "total_count":total,
    }


@router.post("/")
async def create(*, create_data: CollectionCreate) -> Collection:
    """
    Create new collection.
    """
    try:
        collection = await db.collection.create(
            data={
                **create_data.model_dump(),
                "slug": slugify(create_data.name)
            }
        )
        return collection
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{id}")
# @cache(key="collection", hash=False)
async def read(id: int) -> Collection:
    """
    Get a specific collection by id with Redis caching.
    """
    collection = await db.collection.find_unique(
        where={"id": id}
    )
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    return collection


@router.get("/slug/{slug}")
# @cache(key="collection", hash=False)
async def get_by_slug(slug: str) -> Collection:
    """
    Get a collection by its slug.
    """
    collection = await db.collection.find_unique(
        where={"slug": slug}
    )
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    return collection


@router.patch("/{id}", dependencies=[Depends(get_current_user)])
async def update(
    *,
    id: int,
    update_data: CollectionUpdate,
) -> Collection:
    """
    Update a collection and invalidate cache.
    """
    existing = await db.collection.find_unique(
        where={"id": id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Collection not found")

    try:
        update = await db.collection.update(
            where={"id": id},
            data=update_data.model_dump()
        )
        return update
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{id}")
async def delete(id: int) -> Message:
    """
    Delete a collection.
    """
    existing = await db.collection.find_unique(
        where={"id": id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Collection not found")

    try:
        await db.collection.delete(
            where={"id": id}
        )
        return Message(message="Collection deleted successfully")
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/export")
async def export_collections(current_user: CurrentUser):
    try:
        collections = await db.collection.find_many()

        file_url = await export(
            columns=["name", "slug"],
            data=collections,
            name="Collection",
            email=current_user.email,
        )

        return {"message": "Data Export successful", "file_url": file_url}
    except Exception as e:
        logger.error(f"Collections exports failed: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.get("/autocomplete/")
# @cache(key="collections")
async def autocomplete(search: str = "") -> Search:
    """
    Retrieve collections for autocomplete.
    """
    where_clause = None
    if search:
        where_clause = {
            "OR": [
                {"name": {"contains": search, "mode": "insensitive"}},
                {"slug": {"contains": search, "mode": "insensitive"}}
            ]
        }
    collections = await db.collection.find_many(
        where=where_clause,
        order={"created_at": "desc"},
    )
    return Search(results=collections)
