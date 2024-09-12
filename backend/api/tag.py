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
from sqlalchemy.exc import IntegrityError
from sqlmodel import func, or_, select

import crud
from core import deps
from core.deps import (
    SessionDep,
    get_current_user,
)
from core.logging import logger
from models.generic import Tag
from models.message import Message
from models.tag import (
    TagCreate,
    TagPublic,
    Tags,
    TagUpdate,
)
from services.export import export, process_file, validate_file

# Create a router for tags
router = APIRouter()


@router.get(
    "/",
    dependencies=[Depends(get_current_user)],
    response_model=Tags,
)
async def index(
    db: SessionDep,
    name: str = "",
    page: int = Query(default=1, gt=0),
    per_page: int = Query(default=20, le=100),
) -> Tags:
    """
    Retrieve tags.
    """
    query = {"name": name}
    filters = crud.tag.build_query(query)

    count_statement = select(func.count()).select_from(Tag)
    if filters:
        count_statement = count_statement.where(or_(*filters))
    total_count = db.exec(count_statement).one()

    tags = crud.tag.get_multi(
        db=db,
        filters=filters,
        per_page=per_page,
        offset=(page - 1) * per_page,
    )

    total_pages = (total_count // per_page) + (total_count % per_page > 0)

    return Tags(
        tags=tags,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
        total_count=total_count,
    )


@router.post("/", response_model=TagPublic)
def create(*, db: SessionDep, create_data: TagCreate) -> TagPublic:
    """
    Create new tag.
    """
    tag = crud.tag.get_by_key(db=db, value=create_data.name)
    if tag:
        raise HTTPException(
            status_code=400,
            detail="The tag already exists in the system.",
        )

    tag = crud.tag.create(db=db, obj_in=create_data)
    return tag


@router.get("/{id}", response_model=TagPublic)
def read(id: int, db: SessionDep) -> TagPublic:
    """
    Get a specific tag by id.
    """
    tag = crud.tag.get(db=db, id=id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag


@router.patch(
    "/{id}",
    # dependencies=[Depends(get_current_user)],
    response_model=TagPublic,
)
def update(
    *,
    db: SessionDep,
    id: int,
    update_data: TagUpdate,
) -> TagPublic:
    """
    Update a tag.
    """
    db_tag = crud.tag.get(db=db, id=id)
    if not db_tag:
        raise HTTPException(
            status_code=404,
            detail="Tag not found",
        )

    try:
        db_tag = crud.tag.update(db=db, db_obj=db_tag, obj_in=update_data)
        return db_tag
    except IntegrityError as e:
        logger.error(f"Error updating tag, {e.orig.pgerror}")
        raise HTTPException(status_code=422, detail=str(e.orig.pgerror)) from e
    except Exception as e:
        logger.error(f"An error occurred: {e}")
        raise HTTPException(
            status_code=400,
            detail=str(e),
        ) from e


@router.delete("/{id}", dependencies=[Depends(get_current_user)])
def delete(db: SessionDep, id: int) -> Message:
    """
    Delete a tag.
    """
    try:
        tag = crud.tag.get(db=db, id=id)
        if not tag:
            raise HTTPException(status_code=404, detail="Tag not found")
        crud.tag.remove(db=db, id=id)
        return Message(message="Tag deleted successfully")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        ) from e


@router.post("/excel/{task_id}")
async def upload_tags(
    file: Annotated[UploadFile, File()],
    batch: Annotated[str, Form()],
    task_id: str,
    db: SessionDep,
    background_tasks: BackgroundTasks,
):
    await validate_file(file=file)

    contents = await file.read()
    background_tasks.add_task(process_file, contents, task_id, db, crud.tag.bulk_upload)
    return {"batch": batch, "message": "File upload started"}


@router.post("/export")
async def export_tags(
    current_user: deps.CurrentUser, db: SessionDep, bucket: deps.Storage
):
    try:
        tags = db.exec(select(Tag))
        file_url = await export(
            columns=["name", "slug"],
            data=tags,
            name="Tag",
            bucket=bucket,
            email=current_user.email,
        )

        return {"message": "Data Export successful", "file_url": file_url}
    except Exception as e:
        logger.error(f"Export tags error: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get(
    "/autocomplete/",
)
async def autocomplete(
    db: SessionDep,
    search: str = "",
) -> Any:
    """
    Retrieve tags for autocomplete.
    """
    statement = select(Tag)
    if search:
        statement = statement.where(
            or_(Tag.name.like(f"%{search}%"), Tag.slug.like(f"%{search}%"))
        )

    data = db.exec(statement)

    return {"results": data}
