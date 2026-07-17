from typing import Optional
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    BackgroundTasks
)
from prisma.errors import PrismaError
from app.models.collection import (
    CollectionCreate,
    Collection,
    CollectionUpdate,
)
from app.models.generic import Message
from app.prisma_client import prisma as db
from app.core.utils import slugify
from app.core.permissions import require_admin
from app.services.cache import cacheable
from app.core.dependencies.services import CollectionDep

router = APIRouter()

@router.get("/")
@cacheable(key_prefix="collections", key_builder=lambda query: query if query else "all", tags=["collections"], cdn_ttl=604800, cdn_swr=86400)
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


@router.post("/", dependencies=[Depends(require_admin)])
async def create(create_data: CollectionCreate, srv: CollectionDep, bg_tasks: BackgroundTasks) -> Collection:
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
        bg_tasks.add_task(srv.invalidate)
        return collection
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{slug}")
@cacheable(key_prefix="collection", key_builder=lambda slug: slug, cdn_ttl=604800, cdn_swr=86400)
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


@router.patch("/{id}", dependencies=[Depends(require_admin)])
async def update(
    id: int,
    srv: CollectionDep,
    update_data: CollectionUpdate,
    bg_tasks: BackgroundTasks
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
        bg_tasks.add_task(srv.invalidate, slug=update.slug)
        return update
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{id}", dependencies=[Depends(require_admin)])
async def delete(id: int, srv: CollectionDep, bg_tasks: BackgroundTasks) -> Message:
    """
    Delete a collection.
    """
    existing = await db.collection.find_unique(
        where={"id": id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Collection not found")

    try:
        await db.collection.delete(where={"id": id})
        bg_tasks.add_task(srv.invalidate, slug=existing.slug)
        return Message(message="Collection deleted successfully")
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
