from typing import Any
from fastapi import APIRouter, HTTPException
from app.models.shop_settings import (
    ShopSettingsCreate,
    ShopSettingsUpdate
)
from app.models.generic import Message
from app.prisma_client import prisma as db
from prisma.models import ShopSettings

router = APIRouter()

@router.get("/")
async def get_settings() -> list[ShopSettings]:
    """
    Get shop settings with optional filtering
    """
    return await db.shopsettings.find_many()


@router.get("/public")
async def get_public_settings() -> Any:
    """
    Get all public settings
    """
    settings = await db.shopsettings.find_many()

    # Convert to a key-value dictionary
    return {setting.key: setting.value for setting in settings}


@router.get("/{id}")
async def get_setting(id: int) -> ShopSettings:
    """
    Get a specific setting by id
    """
    setting = await db.shopsettings.find_unique(where={"id": id})
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting

# @router.post("/sync")
# async def sync_setting(settings:  list[ShopSettingsCreate]) -> ShopSettings:
#     """
#     Create or update shop settings
#     """
#     try:
#         values_sql = ', '.join(f"({s.id}, '{s.key}', '{s.value}', '{s.type}', '{s.category}', '{s.description}')" for s in settings)

#         query = f'''
#             INSERT INTO "shop_settings" (id, key, value, type, category, description)
#             VALUES {values_sql}
#             ON CONFLICT (id) DO UPDATE SET
#             key = EXCLUDED.key,
#             value = EXCLUDED.value,
#             type = EXCLUDED.type,
#             category = EXCLUDED.category,
#             description = EXCLUDED.description;
#         '''
#         # await db.execute(query)
#         res = await db.execute_raw(query)
#         return res
#         # return await db.shopsettings.create_many(data=[s.model_dump() for s in settings])
#     except Exception as e:
#         print(e)
#         raise HTTPException(status_code=400, detail=str(e))

@router.post("/")
async def create_setting(setting: ShopSettingsCreate) -> ShopSettings:
    """
    Create a new shop setting
    """
    try:
        return await db.shopsettings.create(data=setting.model_dump())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/sync-shop-details")
async def sync_shop_details(form_data: dict[str, Any]):
    """
    Sync shop details
    """

    try:
        for key, value in form_data.items():
            if not value:
                continue
            await db.shopsettings.upsert(
                where={"key": key},
                data={
                    "create": {
                        "key": key,
                        "value": str(value),
                        "category": "general",
                        "type": "SHOP_DETAIL",  # or whatever fits
                        "is_public": True,
                    },
                    "update": {
                        "value": value
                    },
                }
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{id}", response_model=ShopSettings)
async def update_setting(id: int, setting: ShopSettingsUpdate) -> Any:
    """
    Update an existing shop setting
    """
    existing = await db.shopsettings.find_unique(where={"id": id})
    if not existing:
        raise HTTPException(status_code=404, detail="Setting not found")

    try:
        return await db.shopsettings.update(
            where={"id": id},
            data=setting.model_dump(exclude_unset=True)
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{id}", response_model=Message)
async def delete_setting(id: int) -> Any:
    """
    Delete a shop setting
    """
    existing = await db.shopsettings.find_unique(where={"id": id})
    if not existing:
        raise HTTPException(status_code=404, detail="Setting not found")

    try:
        await db.shopsettings.delete(where={"id": id})
        return {"message": "Setting deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
