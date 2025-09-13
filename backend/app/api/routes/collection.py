from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request
)

from app.core.deps import get_current_user
from app.models.collection import (
    CollectionCreate,
    Collection,
    CollectionUpdate,
)
from app.models.generic import Message
from app.prisma_client import prisma as db
from app.core.utils import slugify
from prisma.errors import PrismaError
from typing import Optional
from app.services.redis import cache_response, invalidate_list, bust

router = APIRouter()

@router.get("/")
@cache_response(key_prefix="collections", key=lambda request, query: query)
async def index(request: Request, query: str = "") -> Optional[list[Collection]]:
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
        await invalidate_list("collections")
        return collection
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{slug}")
@cache_response(key_prefix="collection", key=lambda request, slug: slug)
async def get_by_slug(request: Request, slug: str) -> Collection:
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
    Update a collection.
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
        await invalidate_list("collections")
        await bust(f"collection:{update.slug}")
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
        await invalidate_list("collections")
        await bust(f"collection:{existing.slug}")
        return Message(message="Collection deleted successfully")
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
