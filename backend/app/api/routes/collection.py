import json
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

from app import crud
from app.core import deps
from app.core.deps import (
    SessionDep,
    get_current_user,
)
from app.core.logging import logger
from app.models.collection import (
    CollectionCreate,
    Collections,
    CollectionUpdate,
)
from app.models.generic import Collection
from app.models.message import Message
from app.services.export import export, process_file, validate_file

# Create a router for collections
router = APIRouter()


@router.get(
    "/",
    dependencies=[],
)
def index(
    db: SessionDep,
    redis: deps.CacheService,
    name: str = "",
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> Collections:
    """
    Retrieve collections with Redis caching.
    """
    cache_key = f"collections:list:{name}:{page}:{limit}"

    # Try to get from cache first
    cached_data = redis.get(cache_key)
    if cached_data:
        return Collections(**json.loads(cached_data))

    # If not in cache, query database
    query = {"name": name}
    filters = crud.collection.build_query(query)

    count_statement = select(func.count()).select_from(Collection)
    if filters:
        count_statement = count_statement.where(or_(*filters))
    total_count = db.exec(count_statement).one()

    collections = crud.collection.get_multi(
        db=db,
        filters=filters,
        limit=limit,
        offset=(page - 1) * limit,
    )

    total_pages = (total_count // limit) + (total_count % limit > 0)

    result = Collections(
        collections=collections,
        page=page,
        limit=limit,
        total_pages=total_pages,
        total_count=total_count,
    )

    # Cache the result
    redis.set(cache_key, result.model_dump_json())

    return result


@router.post("/")
def create(*, db: SessionDep, create_data: CollectionCreate, redis: deps.CacheService) -> Collection:
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
    redis.delete_pattern("collections:list:*")
    return collection


@router.get("/{id}")
def read(id: int, db: SessionDep, redis: deps.CacheService) -> Collection:
    """
    Get a specific collection by id with Redis caching.
    """
    cache_key = f"collection:{id}"

    # Try to get from cache first
    cached_data = redis.get(cache_key)
    if cached_data:
        return Collection(**json.loads(cached_data))

    collection = crud.collection.get(db=db, id=id)
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    # Cache the result
    redis.set(cache_key, collection.model_dump_json())

    return collection


@router.get("/slug/{slug}")
def get_by_slug(slug: str, db: SessionDep, redis: deps.CacheService) -> Collection:
    """
    Get a collection by its slug.
    """
    cache_key = f"collection:slug:{slug}"

    # Try to get from cache first
    cached_data = redis.get(cache_key)
    if cached_data:
        return Collection(**json.loads(cached_data))

    collection = crud.collection.get_by_key(db=db, key="slug", value=slug)
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")

    # Cache the result
    redis.set(cache_key, collection.model_dump_json())

    return collection


@router.patch(
    "/{id}",
    dependencies=[Depends(get_current_user)],
)
def update(
    *,
    db: SessionDep,
    redis: deps.CacheService,
    id: int,
    update_data: CollectionUpdate,
) -> Collection:
    """
    Update a collection and invalidate cache.
    """
    db_collection = crud.collection.get(db=db, id=id)
    if not db_collection:
        raise HTTPException(
            status_code=404,
            detail="Collection not found",
        )
    try:
        db_collection = crud.collection.update(
            db=db, db_obj=db_collection, obj_in=update_data
        )
        # Invalidate cache
        redis.delete(f"collection:slug:{db_collection.slug}")
        redis.delete(f"collection:{id}")
        redis.delete_pattern("collections:list:*")
        return db_collection
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
def delete(id: int, db: SessionDep, redis: deps.CacheService) -> Message:
    """
    Delete a collection.
    """
    collection = crud.collection.get(db=db, id=id)
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    crud.collection.remove(db=db, id=id)
    redis.delete(f"collection:slug:{collection.slug}")
    redis.delete(f"collection:{id}")
    redis.delete_pattern("collections:list:*")
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
    current_user: deps.CurrentUser, db: SessionDep, bucket: deps.Storage
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
        logger.error(f"Export collections error: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get(
    "/autocomplete/",
)
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

    data = db.exec(statement)

    return {"results": data}
