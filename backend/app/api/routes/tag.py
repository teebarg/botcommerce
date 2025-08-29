from typing import Any

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from prisma.errors import PrismaError

from app.core.deps import get_current_user
from app.models.generic import Message
from app.models.tag import (
    Search,
    TagCreate,
    Tag,
    TagUpdate,
)
from app.prisma_client import prisma as db
from app.core.utils import slugify

router = APIRouter()


@router.post("/")
async def create(*, create_data: TagCreate) -> Tag:
    """
    Create new tag.
    """
    try:
        tag = await db.tag.create(
            data={
                "name": create_data.name,
                "slug": slugify(create_data.name)
            }
        )
        return tag
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/{id}")
async def read(id: int) -> Tag:
    """
    Get a specific tag by id.
    """
    tag = await db.tag.find_unique(
        where={"id": id}
    )
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@router.patch("/{id}", dependencies=[Depends(get_current_user)])
async def update(
    *,
    id: int,
    update_data: TagUpdate,
) -> Tag:
    """
    Update a tag.
    """
    existing = await db.tag.find_unique(
        where={"id": id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Tag not found")

    try:
        update = await db.tag.update(
            where={"id": id},
            data=update_data.model_dump()
        )
        return update
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{id}", dependencies=[Depends(get_current_user)])
async def delete(id: int) -> Message:
    """
    Delete a tag.
    """
    existing = await db.tag.find_unique(
        where={"id": id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Tag not found")

    try:
        await db.tag.delete(
            where={"id": id}
        )
        return Message(message="Tag deleted successfully")
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/autocomplete/")
async def autocomplete(
    search: str = "",
) -> Any:
    """
    Retrieve tags for autocomplete.
    """
    where_clause = None
    if search:
        where_clause = {
            "OR": [
                {"name": {"contains": search, "mode": "insensitive"}},
                {"slug": {"contains": search, "mode": "insensitive"}}
            ]
        }
    tags = await db.tag.find_many(
        where=where_clause,
        order={"created_at": "desc"},
    )
    return Search(results=tags)
