from typing import Any
from fastapi import APIRouter, HTTPException, Request, Depends
from app.prisma_client import prisma as db
from app.core.logging import get_logger
from app.services.redis import cache_response, invalidate_pattern
from app.services.shop_settings import ShopSettingsService
from app.core.deps import get_current_superuser
from pydantic import BaseModel
from datetime import datetime

logger = get_logger(__name__)

router = APIRouter()

class ShopSettings(BaseModel):
    id: int
    key: str
    value: str
    type: str
    created_at: datetime

@router.get("/")
@cache_response(key_prefix="shop-settings", key="all")
async def get_settings(request: Request) -> list[ShopSettings]:
    """
    Get shop settings with optional filtering
    """
    return await db.shopsettings.find_many()


@router.get("/public")
@cache_response(key_prefix="shop-settings", key="public")
async def get_public_settings(request: Request) -> dict[str, str]:
    """
    Get all public settings
    """
    try:
        settings = await db.shopsettings.find_many()

        return { setting.key: setting.value for setting in settings }
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=e.detail)


@router.patch("/sync-shop-details", dependencies=[Depends(get_current_superuser)])
async def sync_shop_details(form_data: dict[str, Any]):
    """
    Sync shop details
    """
    service = ShopSettingsService()

    try:
        for key, value in form_data.items():
            if not value:
                continue
            await service.set(key, str(value), type_="SHOP_DETAIL")
        await invalidate_pattern("shop-settings")
        return {"message": "Shop details synced successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

