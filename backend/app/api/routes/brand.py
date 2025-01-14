import json

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
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
from app.models.brand import (
    BrandCreate,
    BrandPublic,
    Brands,
    BrandUpdate,
)
from app.models.generic import Brand
from app.models.message import Message

# Create a router for brands
router = APIRouter()


@router.get("/")
def index(
    db: SessionDep,
    redis: deps.CacheService,
    name: str = "",
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> Brands:
    """
    Retrieve brands with Redis caching.
    """
    cache_key = f"brands:list:{name}:{page}:{limit}"

    # Try to get from cache first
    cached_data = redis.get(cache_key)
    if cached_data:
        return Brands(**json.loads(cached_data))

    # If not in cache, query database
    query = {"name": name}
    filters = crud.brand.build_query(query)

    count_statement = select(func.count()).select_from(Brand)
    if filters:
        count_statement = count_statement.where(or_(*filters))
    total_count = db.exec(count_statement).one()

    brands = crud.brand.get_multi(
        db=db,
        filters=filters,
        limit=limit,
        offset=(page - 1) * limit,
    )

    total_pages = (total_count // limit) + (total_count % limit > 0)

    result = Brands(
        brands=brands,
        page=page,
        limit=limit,
        total_pages=total_pages,
        total_count=total_count,
    )

    # Cache the result
    redis.set(cache_key, result.model_dump_json())

    return result


@router.post("/")
def create(*, db: SessionDep, create_data: BrandCreate, redis: deps.CacheService) -> BrandPublic:
    """
    Create new brand.
    """
    brand = crud.brand.get_by_key(db=db, value=create_data.name)
    if brand:
        raise HTTPException(
            status_code=400,
            detail="The brand already exists in the system.",
        )

    brand = crud.brand.create(db=db, obj_in=create_data)
    redis.delete_pattern("brands:list:*")
    return brand


@router.get("/{id}")
def read(id: int, db: SessionDep, redis: deps.CacheService) -> BrandPublic:
    """
    Get a specific brand by id with Redis caching.
    """
    cache_key = f"brand:{id}"

    # Try to get from cache first
    cached_data = redis.get(cache_key)
    if cached_data:
        return Brand(**json.loads(cached_data))

    brand = crud.brand.get(db=db, id=id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    # Cache the result
    redis.set(cache_key, brand.model_dump_json())

    return brand


@router.get("/slug/{slug}")
def get_by_slug(slug: str, db: SessionDep, redis: deps.CacheService) -> Brand:
    """
    Get a collection by its slug.
    """
    cache_key = f"brand:slug:{slug}"

    # Try to get from cache first
    cached_data = redis.get(cache_key)
    if cached_data:
        return Brand(**json.loads(cached_data))

    brand = crud.collection.get_by_key(db=db, key="slug", value=slug)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    # Cache the result
    redis.set(cache_key, brand.model_dump_json())

    return brand


@router.patch(
    "/{id}",
    dependencies=[Depends(get_current_user)]
)
def update(
    *,
    db: SessionDep,
    redis: deps.CacheService,
    id: int,
    update_data: BrandUpdate,
) -> BrandPublic:
    """
    Update a brand and invalidate cache.
    """
    db_brand = crud.brand.get(db=db, id=id)
    if not db_brand:
        raise HTTPException(
            status_code=404,
            detail="Brand not found",
        )

    try:
        db_brand = crud.brand.update(db=db, db_obj=db_brand, obj_in=update_data)
        # Invalidate cache
        redis.delete(f"brand:slug:{db_brand.slug}")
        redis.delete(f"brand:{id}")
        redis.delete_pattern("brands:list:*")
        return db_brand
    except IntegrityError as e:
        logger.error(f"Error updating brand, {e.orig.pgerror}")
        raise HTTPException(status_code=422, detail=str(e.orig.pgerror)) from e
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400,
            detail=f"{e}",
        ) from e


@router.delete("/{id}", dependencies=[Depends(get_current_user)])
def delete(id: int, db: SessionDep, redis: deps.CacheService) -> Message:
    """
    Delete a brand.
    """
    brand = crud.brand.get(db=db, id=id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    crud.brand.remove(db=db, id=id)
    redis.delete(f"brand:slug:{brand.slug}")
    redis.delete(f"brand:{id}")
    redis.delete_pattern("brands:list:*")
    return Message(message="Brand deleted successfully")
