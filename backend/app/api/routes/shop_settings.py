from typing import Any
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from app.core.dependencies.services import SettingsDep
from app.core.dependencies.cache import CacheDep
from app.services.cache import cacheable
from app.prisma_client import prisma as db
from app.core.logging import get_logger
from datetime import datetime
from app.core.permissions import require_admin
from app.lib.cache import purge_vercel_tags, set_public_cache

logger = get_logger(__name__)

router = APIRouter()

class ShopSettings(BaseModel):
    id: int
    key: str
    value: str
    type: str
    created_at: datetime

@router.get("/")
@cacheable(key_prefix="shop-settings", key_builder=False, tags=["shop-settings"], expire=60 * 60 * 24 * 30)
async def index(request: Request) -> list[ShopSettings]:
    """
    Get shop settings with optional filtering
    """
    set_public_cache(request)
    return await db.shopsettings.find_many()


@router.patch("/", dependencies=[Depends(require_admin)])
async def update(form_data: dict[str, Any], cache: CacheDep,  service: SettingsDep):
    """
    Sync shop details
    """
    try:
        for key, value in form_data.items():
            if not value:
                continue
            await service.set(key, str(value), type_="SHOP_DETAIL")
        await cache.invalidate(tags=["shop-settings"])
        await purge_vercel_tags("shop-settings")
        return {"message": "Shop details updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

