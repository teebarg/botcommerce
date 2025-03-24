from typing import Annotated, Any

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
)
from math import ceil
from prisma.errors import PrismaError

from app.core.deps import get_current_user
from app.core.logging import logger
from app.models.generic import Message
from app.models.tag import (
    Search,
    TagCreate,
    Tags,
    Tag,
    TagUpdate,
)
from app.services.export import export, validate_file
from app.prisma_client import prisma as db
from app.core.utils import slugify

# Create a router for tags
router = APIRouter()


@router.get("/", dependencies=[Depends(get_current_user)])
# @cache(key="tags")
async def index(
    query: str = "",
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
):
    """
    Retrieve tags.
    """
    where_clause = None
    if query:
        where_clause = {
            "OR": [
                {"name": {"contains": query, "mode": "insensitive"}},
                {"slug": {"contains": query, "mode": "insensitive"}}
            ]
        }
    tags = await db.tag.find_many(
        where=where_clause,
        skip=(page - 1) * limit,
        take=limit,
        order={"created_at": "desc"},
    )
    total = await db.tag.count(where=where_clause)
    return {
        "tags":tags,
        "page":page,
        "limit":limit,
        "total_pages":ceil(total/limit),
        "total_count":total,
    }


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
# @cache(key="tag")
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


@router.post("/excel/{task_id}")
async def upload_tags(
    file: Annotated[UploadFile, File()],
    batch: Annotated[str, Form()],
    task_id: str,
    background_tasks: BackgroundTasks,
):
    await validate_file(file=file)

    contents = await file.read()
    background_tasks.add_task(process_file, contents, task_id, db)
    return {"batch": batch, "message": "File upload started"}


@router.get("/autocomplete/")
# @cache(key="tags")
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
