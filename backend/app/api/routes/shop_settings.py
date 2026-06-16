from typing import Any
from app.core.dependencies.services import SettingsDep
from app.core.dependencies.cache import CacheDep
from app.services.cache import cacheable
from fastapi import APIRouter, HTTPException, Request, Depends
from app.prisma_client import prisma as db
from app.core.logging import get_logger
from pydantic import BaseModel
from datetime import datetime
from app.core.permissions import require_admin

logger = get_logger(__name__)

router = APIRouter()

class ShopSettings(BaseModel):
    id: int
    key: str
    value: str
    type: str
    created_at: datetime

@router.get("/")
@cacheable(key_prefix="shop-settings", key_builder=False, expire=259200000)
async def index(request: Request) -> list[ShopSettings]:
    """
    Get shop settings with optional filtering
    """
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
        await cache.invalidate("shop-settings")
        return {"message": "Shop details updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

