from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)
from sqlalchemy.exc import IntegrityError
from sqlmodel import func, or_, select

from app.core.decorators import cache
from app.core import crud
from app.core.deps import (
    CacheService,
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
@cache(key="brands")
async def index(
    db: SessionDep,
    name: str = "",
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> Brands:
    """
    Retrieve brands with Redis caching.
    """
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

    return Brands(
        brands=brands,
        page=page,
        limit=limit,
        total_pages=total_pages,
        total_count=total_count,
    )


@router.post("/")
async def create(*, db: SessionDep, create_data: BrandCreate, cache: CacheService) -> BrandPublic:
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
    cache.invalidate("brands")
    return brand


@router.get("/{id}")
@cache(key="brand")
async def read(id: int, db: SessionDep) -> BrandPublic:
    """
    Get a specific brand by id with Redis caching.
    """
    brand = crud.brand.get(db=db, id=id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    return brand


@router.get("/slug/{slug}")
@cache(key="brand")
async def get_by_slug(slug: str, db: SessionDep) -> Brand:
    """
    Get a collection by its slug.
    """
    brand = crud.collection.get_by_key(db=db, key="slug", value=slug)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")

    return brand


@router.patch(
    "/{id}",
    dependencies=[Depends(get_current_user)]
)
async def update(
    *,
    db: SessionDep,
    cache: CacheService,
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
        cache.delete(f"brand:{db_brand.slug}")
        cache.delete(f"brand:{id}")
        cache.invalidate("brands")
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
async def delete(id: int, db: SessionDep, cache: CacheService) -> Message:
    """
    Delete a brand.
    """
    brand = crud.brand.get(db=db, id=id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    crud.brand.remove(db=db, id=id)
    cache.delete(f"brand:{brand.slug}")
    cache.delete(f"brand:{id}")
    cache.invalidate("brands")
    return Message(message="Brand deleted successfully")
