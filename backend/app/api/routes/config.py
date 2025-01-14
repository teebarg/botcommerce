from typing import Any

from fastapi import APIRouter, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import func, select

from app.core.decorators import cache
from app.core.deps import CacheService, SessionDep
from app.core.logging import logger
from app.crud import siteconfig
from app.models.config import (
    SiteConfig,
    SiteConfigCreate,
    SiteConfigs,
    SiteConfigUpdate,
)
from app.models.message import Message

router = APIRouter()

@router.get("/site-config", response_model=dict[str, str])
@cache(key="configs")  # Cache for 24hrs
async def site_config(
    db: SessionDep,
) -> Any:
    """
    Retrieve site configuration.
    """
    config = siteconfig.configs(db=db)
    return config


@router.get(
    "/",
    dependencies=[],
)
@cache(key="configs")  # Cache for 24hrs
async def index(
    db: SessionDep,
    skip: int = 0, limit: int = 20
) -> SiteConfigs:
    """
    Retrieve configs with Redis caching.
    """
    count_statement = select(func.count()).select_from(SiteConfig)
    count = db.exec(count_statement).one()
    statement = select(SiteConfig).offset(skip).limit(limit)
    items = db.exec(statement).all()


    pages = (count // limit) + (count % limit > 0)

    result = SiteConfigs(
        configs=items,
        page=skip,
        limit=limit,
        total_pages=pages,
        total_count=count,
    )

    return result

@router.get("/{id}")
@cache(key="config")  # Cache for 24hrs
async def read(id: int, db: SessionDep) -> SiteConfig:
    """
    Get a specific config by id with Redis caching.
    """
    config = siteconfig.get(db=db, id=id)
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")

    return config

@router.post("/", response_model=SiteConfig)
async def create(
    *,
    db: SessionDep,
    config_in: SiteConfigCreate,
    cache: CacheService,
) -> Any:
    """
    Create new site configuration.
    """
    config = siteconfig.get_by_key(db=db, value=config_in.key)
    if config:
        raise HTTPException(
            status_code=400,
            detail="The config already exists in the system.",
        )

    cache.delete_pattern("configs:*")
    return siteconfig.create(db=db, obj_in=config_in)


@router.patch("/{id}", response_model=SiteConfig)
async def update(
    *,
    db: SessionDep,
    id: str,
    config_in: SiteConfigUpdate,
    cache: CacheService,
) -> Any:
    """
    Update site configuration.
    """
    config = siteconfig.get(db=db, id=id)
    if not config:
        raise HTTPException(status_code=404, detail="Site configuration not found")

    try:
        config = siteconfig.update(db=db, db_obj=config, obj_in=config_in)
        # Invalidate cache
        cache.delete(f"config:{id}")
        cache.delete_pattern("configs:*")
        return config
    except IntegrityError as e:
        logger.error(f"Error updating config, {e.orig.pgerror}")
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
    Delete a config.
    """
    config = siteconfig.get(db=db, id=id)
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")
    siteconfig.remove(db=db, id=id)
    # Invalidate cache
    cache.delete(f"config:{id}")
    cache.delete_pattern("configs:*")
    return Message(message="Config deleted successfully")
