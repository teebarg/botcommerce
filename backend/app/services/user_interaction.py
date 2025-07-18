from app.prisma_client import prisma as db
from typing import Optional, Any
from datetime import datetime
from prisma import Json

async def log_user_interaction(user_id: int, product_id: int, type: str, metadata: Optional[dict[str, Any]] = None):
    interaction = await db.userinteraction.create(
        data={
            "type": type,
            "metadata": Json(metadata),
            "timestamp": datetime.now(),
            "user": {"connect": {"id": user_id}},
            "product": {"connect": {"id": product_id}},
        }
    )
    return interaction 