import asyncio
from datetime import datetime
from typing import Any, Optional
from app.core.config import settings
from app.services.shop_settings import ShopSettingsService

async def merge_metadata(
    service: ShopSettingsService, 
    metadata: Optional[dict[str, Any]] = None
) -> dict[str, Any]:
    if metadata is None:
        metadata = {}

    keys = ["shop_name", "address", "contact_phone", "facebook", "instagram", "tiktok", "shop_email"]
    shop_name, shop_address, shop_phone, facebook, instagram, tiktok, shop_email = await asyncio.gather(
        *(service.get(key) for key in keys)
    )

    return {
        "project_name": shop_name,
        "address": shop_address,
        "phone": shop_phone,
        "description": "Exclusive offers just for you",
        "frontend_host": settings.FRONTEND_HOST,
        "facebook": facebook,
        "instagram": instagram,
        "tiktok": tiktok,
        "support_email": shop_email,
        "current_year": datetime.now().year,
        **metadata
    }
