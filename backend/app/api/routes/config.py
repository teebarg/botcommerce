from typing import Any

from fastapi import APIRouter, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import func, select

from app.core import crud
from app.core.decorators import cache
from app.core.deps import CacheService, SessionDep
from app.core.logging import logger
from app.models.config import (
    SiteConfig,
    SiteConfigCreate,
    SiteConfigs,
    SiteConfigUpdate,
)
from app.models.message import Message
from prisma.errors import PrismaError

router = APIRouter()


@router.get("/site-config", response_model=dict[str, str])
@cache(key="configs")  # Cache for 24hrs
async def site_config(
    db: SessionDep,
) -> Any:
    """
    Retrieve site configuration.
    """
    return crud.siteconfig.configs(db=db)


@router.get("/")
# @cache(key="configs")  # Cache for 24hrs
async def index(
    skip: int = 0, limit: int = 20
):
    """
    Retrieve configs with Redis caching.
    """
    configs = await db.siteconfig.find_many(
        skip=skip,
        take=limit,
        order={"created_at": "desc"},
    )
    total = await db.siteconfig.count()
    return {
        "configs": configs,
        "page": skip,
        "limit": limit,
        "total_pages": ceil(total/limit),
        "total_count": total,
    }


@router.get("/{id}")
# @cache(key="config")  # Cache for 24hrs
async def read(id: int) -> SiteConfig:
    """
    Get a specific config by id with Redis caching.
    """
    config = await db.siteconfig.find_unique(
        where={"id": id}
    )
    if not config:
        raise HTTPException(status_code=404, detail="Config not found")

    return config


@router.post("/", response_model=SiteConfig)
async def create(
    *,
    config_in: SiteConfigCreate
) -> Any:
    """
    Create new site configuration.
    """
    try:
        config = await db.siteconfig.create(
            data={
                "key": config_in.key,
                "value": config_in.value
            }
        )
        return config
    except PrismaError as e:
        raise HTTPException(
            status_code=500, detail=f"Database error: {str(e)}")


@router.patch("/{id}", response_model=SiteConfig)
async def update(
    *,
    id: str,
    config_in: SiteConfigUpdate
) -> Any:
    """
    Update site configuration.
    """
    existing = await db.siteconfig.find_unique(
        where={"id": id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Config not found")

    try:
        update = await db.siteconfig.update(
            where={"id": id},
            data=config_in.model_dump()
        )
        return update
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{id}")
async def delete(id: int) -> Message:
    """
    Delete a config.
    """
    existing = await db.siteconfig.find_unique(
        where={"id": id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Config not found")

    try:
        await db.siteconfig.delete(
            where={"id": id}
        )
        return Message(message="Config deleted successfully")
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
