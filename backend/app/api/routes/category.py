import json
from datetime import datetime
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
from sqlmodel import SQLModel, func, or_, select

from app import crud
from app.core import deps
from app.core.deps import (
    SessionDep,
    get_current_user,
)
from app.core.logging import logger
from app.models.category import (
    CategoryCreate,
    CategoryUpdate,
)
from app.models.generic import Category, CategoryPublic
from app.models.message import Message
from app.services.export import export, process_file, validate_file

# Create a router for categories
router = APIRouter()

# Custom JSON encoder for datetime
def custom_serializer(obj: Any) -> str:
    if isinstance(obj, datetime):
        return obj.isoformat()  # Serialize datetime as ISO 8601 string
    raise TypeError("Type not serializable")

# Custom JSON decoder for datetime
def custom_deserializer(obj: dict) -> dict:
    for key, value in obj.items():
        if isinstance(value, str) and "T" in value:  # ISO 8601 detection
            try:
                obj[key] = datetime.fromisoformat(value)
            except ValueError:
                pass
    return obj


class Categories(SQLModel):
    categories: list[CategoryPublic]
    page: int
    limit: int
    total_count: int
    total_pages: int


@router.get("/", dependencies=[])
def index(
    db: SessionDep,
    redis: deps.CacheService,
    name: str = "",
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> Categories:
    """
    Retrieve categories with Redis caching.
    """
    cache_key = f"categories:list:{name}:{page}:{limit}"

    # Try to get from cache first
    cached_data = redis.get(cache_key)
    if cached_data:
        return Categories(**json.loads(cached_data, object_hook=custom_deserializer))

    query = {"name": name}
    filters = crud.category.build_query(query)

    count_statement = select(func.count()).select_from(Category)
    if filters:
        count_statement = count_statement.where(or_(*filters))
    total_count = db.exec(count_statement).one()

    categories = crud.category.get_multi(
        db=db,
        filters=filters,
        limit=limit,
        offset=(page - 1) * limit,
    )

    total_pages = (total_count // limit) + (total_count % limit > 0)

    result = Categories(
        categories=categories,
        page=page,
        limit=limit,
        total_pages=total_pages,
        total_count=total_count,
    )

    # Cache the result
    redis.set(cache_key, json.dumps(result.model_dump(), default=custom_serializer))

    return result


@router.post("/")
def create(*, db: SessionDep, create_data: CategoryCreate, redis: deps.CacheService) -> Category:
    """
    Create new category.
    """
    category = crud.category.get_by_key(db=db, value=create_data.name)
    if category:
        raise HTTPException(
            status_code=400,
            detail="The category already exists in the system.",
        )

    category = crud.category.create(db=db, obj_in=create_data)
    redis.delete_pattern("categories:list:*")
    return category


@router.get("/{id}")
def read(id: int, db: SessionDep, redis: deps.CacheService) -> CategoryPublic:
    """
    Get a specific category by id with Redis caching.
    """
    cache_key = f"category:{id}"

    # Try to get from cache first
    cached_data = redis.get(cache_key)
    if cached_data:
        return CategoryPublic(**json.loads(cached_data))

    category = crud.category.get(db=db, id=id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Cache the result
    redis.set(cache_key, category.model_dump_json())

    return category


@router.get("/slug/{slug}")
def get_by_slug(slug: str, db: SessionDep, redis: deps.CacheService) -> Category:
    """
    Get a category by its slug.
    """
    cache_key = f"category:slug:{slug}"

    # Try to get from cache first
    cached_data = redis.get(cache_key)
    if cached_data:
        return Category(**json.loads(cached_data))

    category = crud.category.get_by_key(db=db, key="slug", value=slug)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Cache the result
    redis.set(cache_key, category.model_dump_json())

    return category


@router.patch("/{id}", dependencies=[Depends(get_current_user)])
def update(
    *,
    db: SessionDep,
    redis: deps.CacheService,
    id: int,
    update_data: CategoryUpdate,
) -> Category:
    """
    Update a category and invalidate cache.
    """
    db_category = crud.category.get(db=db, id=id)
    if not db_category:
        raise HTTPException(
            status_code=404,
            detail="Category not found",
        )
    try:
        db_category = crud.category.update(
            db=db, db_obj=db_category, obj_in=update_data
        )
        # Invalidate cache
        redis.delete(f"category:slug:{db_category.slug}")
        redis.delete(f"category:{id}")
        redis.delete_pattern("categories:list:*")
        return db_category
    except IntegrityError as e:
        logger.error(f"Error updating category, {e.orig.pgerror}")
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
    Delete a category.
    """
    category = crud.category.get(db=db, id=id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    crud.category.remove(db=db, id=id)
    redis.delete(f"category:slug:{category.slug}")
    redis.delete(f"category:{id}")
    redis.delete_pattern("categories:list:*")
    return Message(message="Category deleted successfully")


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
        process_file, contents, task_id, db, crud.category.bulk_upload
    )
    return {"batch": batch, "message": "File upload started"}


@router.post("/export")
async def export_collections(
    current_user: deps.CurrentUser, db: SessionDep, bucket: deps.Storage
):
    try:
        categories = db.exec(select(Category))
        file_url = await export(
            columns=["name", "slug"],
            data=categories,
            name="Category",
            bucket=bucket,
            email=current_user.email,
        )

        return {"message": "Data Export successful", "file_url": file_url}
    except Exception as e:
        logger.error(f"Export categories error: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get(
    "/autocomplete/",
)
async def autocomplete(
    db: SessionDep,
    search: str = "",
) -> Any:
    """
    Retrieve categories for autocomplete.
    """
    statement = select(Category)
    if search:
        statement = statement.where(
            or_(Category.name.like(f"%{search}%"), Category.slug.like(f"%{search}%"))
        )

    data = db.exec(statement)

    return {"results": data}
