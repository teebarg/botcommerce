from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Request
)


from app.core.deps import (
    get_current_user,
    RedisClient
    
)
from app.models.collection import (
    CollectionCreate,
    Collection,
    Collections,
    CollectionUpdate,
    Search,
)
from app.models.generic import Message
from app.prisma_client import prisma as db
from app.core.utils import slugify
from prisma.errors import PrismaError
from typing import Optional
from math import ceil
from app.services.redis import cache_response

router = APIRouter()

@router.get("/all")
@cache_response(key_prefix="collections")
async def all_collections(request: Request, query: str = "") -> Optional[list[Collection]]:
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
@cache_response(key_prefix="collections")
async def index(
    request: Request,
    query: str = "",
    skip: int = Query(default=0, ge=0),
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
        skip=skip,
        take=limit,
        order={"created_at": "desc"},
    )
    total = await db.collection.count(where=where_clause)
    return {
        "collections":collections,
        "skip":skip,
        "limit":limit,
        "total_pages":ceil(total/limit),
        "total_count":total,
    }


@router.post("/")
async def create(*, create_data: CollectionCreate, cache: RedisClient) -> Collection:
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
        await cache.invalidate_list_cache("collections")
        return collection
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{id}")
@cache_response(key_prefix="collection", key=lambda request, id: id)
async def read(request: Request, id: int) -> Collection:
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
    cache: RedisClient,
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
        await cache.invalidate_list_cache("collections")
        await cache.bust_tag(f"collection:{id}")
        await cache.bust_tag(f"collection:{update.slug}")
        return update
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{id}")
async def delete(id: int, cache: RedisClient) -> Message:
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
        await cache.invalidate_list_cache("collections")
        await cache.bust_tag(f"collection:{id}")
        await cache.bust_tag(f"collection:{existing.slug}")
        return Message(message="Collection deleted successfully")
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/autocomplete/")
@cache_response(key_prefix="collections")
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
