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

from app.core.decorators import cache
from app.core.deps import CacheService, CurrentUser, SessionDep, Storage, get_current_user
from app.core.logging import logger
from app.models.collection import (
    CollectionCreate,
    Collections,
    CollectionUpdate,
    Search,
)
from app.models.generic import Collection
from app.models.message import Message
from app.services.export import export, process_file, validate_file
from app.core import crud

# Create a router for collections
router = APIRouter()


@router.get("/")
@cache(key="collections")
async def index(
    db: SessionDep,
    name: str = "",
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> Collections:
    """
    Retrieve collections with Redis caching.
    """
    query = {"name": name}
    filters = crud.collection.build_query(query)

    count_statement = select(func.count()).select_from(Collection)
    if filters:
        count_statement = count_statement.where(or_(*filters))
    count = db.exec(count_statement).one()

    collections = crud.collection.get_multi(
        db=db,
        filters=filters,
        limit=limit,
        offset=(page - 1) * limit,
    )

    pages = (count // limit) + (count % limit > 0)

    return Collections(
        collections=collections,
        page=page,
        limit=limit,
        total_pages=pages,
        total_count=count,
    )


@router.post("/")
async def create(*, db: SessionDep, create_data: CollectionCreate, cache: CacheService) -> Collection:
    """
    Create new collection.
    """
    collection = crud.collection.get_by_key(db=db, value=create_data.name)
    if collection:
        raise HTTPException(
            status_code=400,
            detail="The collection already exists in the system.",
        )

    collection = crud.collection.create(db=db, obj_in=create_data)
    cache.invalidate("collections")
    return collection


@router.get("/{id}")
@cache(key="collection")
async def read(id: int, db: SessionDep) -> Collection:
    """
    Get a specific collection by id with Redis caching.
    """
    collection = crud.collection.get(db=db, id=id)
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    return collection


@router.get("/slug/{slug}")
@cache(key="collection")
async def get_by_slug(slug: str, db: SessionDep) -> Collection:
    """
    Get a collection by its slug.
    """
    collection = crud.collection.get_by_key(db=db, key="slug", value=slug)
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    return collection


@router.patch("/{id}", dependencies=[Depends(get_current_user)])
async def update(
    *,
    db: SessionDep,
    cache: CacheService,
    id: int,
    update_data: CollectionUpdate,
) -> Collection:
    """
    Update a collection and invalidate cache.
    """
    collection = crud.collection.get(db=db, id=id)
    if not collection:
        raise HTTPException(
            status_code=404,
            detail="Collection not found",
        )
    try:
        collection = crud.collection.update(
            db=db, db_obj=collection, obj_in=update_data
        )
        # Invalidate cache
        cache.delete(f"collection:{collection.slug}")
        cache.delete(f"collection:{id}")
        cache.invalidate("collections")
        return collection
    except IntegrityError as e:
        logger.error(f"Error updating collection, {e.orig.pgerror}")
        raise HTTPException(status_code=422, detail=str(e.orig.pgerror)) from e
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400,
            detail=f"{e}",
        ) from e


@router.delete("/{id}")
async def delete(id: int, db: SessionDep, cache: CacheService) -> Message:
    """
    Delete a collection.
    """
    collection = crud.collection.get(db=db, id=id)
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    crud.collection.remove(db=db, id=id)
    # Invalidate cache
    cache.delete(f"collection:{collection.slug}")
    cache.delete(f"collection:{id}")
    cache.invalidate("collections")
    return Message(message="Collection deleted successfully")


@router.post("/excel/{task_id}")
async def upload_collections(
    file: Annotated[UploadFile, File()],
    batch: Annotated[str, Form()],
    task_id: str,
    db: SessionDep,
    background_tasks: BackgroundTasks,
):
    await validate_file(file=file)

    contents = await file.read()
    background_tasks.add_task(
        process_file, contents, task_id, db, crud.collection.bulk_upload
    )
    return {"batch": batch, "message": "File upload started"}


@router.post("/export")
async def export_collections(
    current_user: CurrentUser, db: SessionDep, bucket: Storage
):
    try:
        collections = db.exec(select(Collection))
        file_url = await export(
            columns=["name", "slug"],
            data=collections,
            name="Collection",
            bucket=bucket,
            email=current_user.email,
        )

        return {"message": "Data Export successful", "file_url": file_url}
    except Exception as e:
        logger.error(f"Collections exports failed: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e

@router.get("/autocomplete/")
@cache(key="collections")
async def autocomplete(
    db: SessionDep,
    search: str = "",
) -> Any:
    """
    Retrieve collections for autocomplete.
    """
    statement = select(Collection)
    if search:
        statement = statement.where(
            or_(
                Collection.name.like(f"%{search}%"), Collection.slug.like(f"%{search}%")
            )
        )

    data = db.exec(statement).all()
    return Search(results=data)
