from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request

from app.core.dependencies.services import SettingsDep
from app.core.logging import get_logger
from app.core.permissions import require_admin
from app.prisma_client import DbDep
from app.schemas.shop_settings import ShopSettingCreate, ShopSettingUpdate
from app.services.cache import cacheable

logger = get_logger(__name__)

router = APIRouter()

@router.get("/")
@cacheable(key_prefix="shop-settings", key_builder="config", tags=["shop-settings"], expire=2592000, cdn_ttl=31536000, cdn_swr=604800)
async def index(request: Request, db: DbDep) -> dict[str, Any]:
    """
    Get shop settings with optional filtering
    """
    settings = await db.shopsettings.find_many()

    return {
        setting.key: setting.value
        for setting in settings
    }

@router.get("/all")
async def list_settings(srv: SettingsDep):
    return await srv.get_all()

@router.post("/", dependencies=[Depends(require_admin)], status_code=201)
async def create_setting(
    payload: ShopSettingCreate, srv: SettingsDep
):
    existing = await srv.get_by_key(payload.key)
    if existing:
        raise HTTPException(status_code=409, detail="Key already exists")
    return await srv.create(payload.key, payload.value)


@router.patch("/{id}", dependencies=[Depends(require_admin)])
async def update_setting(
    id: int, payload: ShopSettingUpdate, srv: SettingsDep
):
    existing = await srv.get_by_id(id)
    if not existing:
        raise HTTPException(status_code=404, detail="Setting not found")
    return await srv.update(id, payload.value)


@router.delete("/{id}", dependencies=[Depends(require_admin)], status_code=204)
async def delete_setting(id: int, srv: SettingsDep):
    existing = await srv.get_by_id(id)
    if not existing:
        raise HTTPException(status_code=404, detail="Setting not found")
    await srv.delete(id)
