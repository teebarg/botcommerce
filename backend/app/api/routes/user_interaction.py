from typing import List
from fastapi import APIRouter, Body, Depends
from app.core.deps import UserDep
from app.core.dependencies.services import get_interaction_service
from app.core.dependencies.cache import CacheDep
from app.schemas.user_interaction import UserInteractionCreate
from app.services.user_interaction import InteractionService
from app.core.logging import get_logger
from app.models.generic import Message

logger = get_logger(__name__)

router = APIRouter()

@router.post("/batch")
async def batch_user_interactions(cache: CacheDep, user: UserDep, srv: InteractionService = Depends(get_interaction_service), payload: List[UserInteractionCreate] = Body(...)) -> Message:
    if not user:
        return Message(message="You are not logged in")
    for item in payload:
        await srv.log_user_interaction(
            user_id=user.id,
            product_id=item.product_id,
            type=item.type,
            metadata=item.metadata,
        )
    await cache.invalidate(tags=["interactions"])
    return Message(message="success")
