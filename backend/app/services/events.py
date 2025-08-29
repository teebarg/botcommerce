from typing import Any, Dict, Optional

from app.services.redis import CacheService
from app.models.user import User


async def publish_user_registered(
    cache: CacheService,
    *,
    user: User,
    source: str,
    created_at: Optional[Any] = None,
) -> None:
    payload: Dict[str, Any] = {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "status": user.status,
        "role": user.role,
        "source": source,
    }
    if created_at is not None:
        payload["created_at"] = created_at

    await cache.publish_event("USER_REGISTERED", payload)


