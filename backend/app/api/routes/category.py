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

from app.core import crud
from app.core.decorators import cache
from app.core.deps import (
    CacheService,
    CurrentUser,
    SessionDep,
    Storage,
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

class Categories(SQLModel):
    categories: list[CategoryPublic]
    page: int
    limit: int
    total_count: int
    total_pages: int


class Search(SQLModel):
    results: list[CategoryPublic]


@router.get("/", dependencies=[])
@cache(key="categories")
async def index(
    db: SessionDep,
    name: str = "",
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> Categories:
    """
    Retrieve categories with Redis caching.
    """
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

    return Categories(
        categories=categories,
        page=page,
        limit=limit,
        total_pages=total_pages,
        total_count=total_count,
    )


@router.post("/")
async def create(*, db: SessionDep, create_data: CategoryCreate, cache: CacheService) -> Category:
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
    cache.invalidate("categories")
    return category


@router.get("/{id}")
@cache(key="category", hash=False)
async def read(id: int, db: SessionDep) -> CategoryPublic:
    """
    Get a specific category by id with Redis caching.
    """
    category = crud.category.get(db=db, id=id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    return category


@router.get("/slug/{slug}")
@cache(key="category", hash=False)
async def get_by_slug(slug: str, db: SessionDep) -> Category:
    """
    Get a category by its slug.
    """
    category = crud.category.get_by_key(db=db, key="slug", value=slug)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    return category


@router.patch("/{id}", dependencies=[Depends(get_current_user)])
async def update(
    *,
    db: SessionDep,
    cache: CacheService,
    id: int,
    update_data: CategoryUpdate,
) -> Category:
    """
    Update a category and invalidate cache.
    """
    category = crud.category.get(db=db, id=id)
    if not category:
        raise HTTPException(
            status_code=404,
            detail="Category not found",
        )
    try:
        category = crud.category.update(
            db=db, db_obj=category, obj_in=update_data
        )
        # Invalidate cache
        cache.delete(f"category:{category.slug}")
        cache.delete(f"category:{id}")
        cache.invalidate("categories")
        return category
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
async def delete(id: int, db: SessionDep, cache: CacheService) -> Message:
    """
    Delete a category.
    """
    category = crud.category.get(db=db, id=id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    crud.category.remove(db=db, id=id)
    cache.delete(f"category:{category.slug}")
    cache.delete(f"category:{id}")
    cache.invalidate("categories")
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
    current_user: CurrentUser, db: SessionDep, bucket: Storage
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

@router.get("/autocomplete/")
@cache(key="categories")
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
    return Search(results=data)
