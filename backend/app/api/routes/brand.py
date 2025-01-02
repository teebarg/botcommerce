from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)
from sqlmodel import func, or_, select

from app import crud
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


@router.get(
    "/",
    # dependencies=[Depends(get_current_user)],
    response_model=Brands,
)
def index(
    db: SessionDep,
    name: str = "",
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> Brands:
    """
    Retrieve brands.
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
        Brands=brands,
        page=page,
        limit=limit,
        total_pages=total_pages,
        total_count=total_count,
    )


@router.post("/", response_model=BrandPublic)
def create(*, db: SessionDep, create_data: BrandCreate) -> BrandPublic:
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
    return brand


@router.get("/{id}", response_model=BrandPublic)
def read(id: int, db: SessionDep) -> BrandPublic:
    """
    Get a specific brand by id.
    """
    brand = crud.brand.get(db=db, id=id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand


@router.patch(
    "/{id}",
    dependencies=[Depends(get_current_user)],
    response_model=BrandPublic,
)
def update(
    *,
    db: SessionDep,
    id: int,
    update_data: BrandUpdate,
) -> BrandPublic:
    """
    Update a brand.
    """
    db_brand = crud.brand.get(db=db, id=id)
    if not db_brand:
        raise HTTPException(
            status_code=404,
            detail="Brand not found",
        )

    try:
        db_brand = crud.brand.update(db=db, db_obj=db_brand, obj_in=update_data)
        return db_brand
    except Exception as e:
        logger.error(e)
        if "psycopg2.errors.UniqueViolation" in str(e):
            raise HTTPException(
                status_code=422,
                detail=str(e),
            ) from e
        raise HTTPException(
            status_code=400,
            detail=str(e),
        ) from e


@router.delete("/{id}", dependencies=[Depends(get_current_user)])
def delete(db: SessionDep, id: int) -> Message:
    """
    Delete a brand.
    """
    brand = crud.brand.get(db=db, id=id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    crud.brand.remove(db=db, id=id)
    return Message(message="Brand deleted successfully")
