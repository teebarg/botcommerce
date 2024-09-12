from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)
from sqlmodel import func, or_, select

import crud
from core.deps import (
    SessionDep,
    get_current_user,
)
from core.logging import logger
from models.brand import (
    BrandCreate,
    BrandPublic,
    Brands,
    BrandUpdate,
)
from models.generic import Brand
from models.message import Message

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
    per_page: int = Query(default=20, le=100),
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
        per_page=per_page,
        offset=(page - 1) * per_page,
    )

    total_pages = (total_count // per_page) + (total_count % per_page > 0)

    return Brands(
        Brands=brands,
        page=page,
        per_page=per_page,
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
