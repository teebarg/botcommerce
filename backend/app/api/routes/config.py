from typing import Any

from fastapi import APIRouter, HTTPException, Query

from app.models.config import (
    SiteConfig,
    SiteConfigCreate,
    SiteConfigs,
    SiteConfigUpdate,
)
from app.models.generic import Message
from prisma.errors import PrismaError
from app.prisma_client import prisma as db
from math import ceil

router = APIRouter()


@router.get("/site-config", response_model=dict[str, str])
async def site_config() -> Any:
    """
    Retrieve site configuration.
    """
    return await db.siteconfig.find_many()


@router.get("/")
async def index(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, le=100),
) -> SiteConfigs:
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
        "skip": skip,
        "limit": limit,
        "total_pages": ceil(total/limit),
        "total_count": total,
    }


@router.get("/{id}")
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
) -> SiteConfig:
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


@router.patch("/{id}")
async def update(
    id: int,
    config_in: SiteConfigUpdate
) -> SiteConfig:
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
