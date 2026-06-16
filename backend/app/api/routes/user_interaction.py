from fastapi import APIRouter, Query, Body, Request, Depends
from app.core.deps import UserDep
from app.core.dependencies.services import get_interaction_service
from app.core.dependencies.cache import CacheDep
from app.services.cache import cacheable
from typing import List, Optional
from app.schemas.user_interaction import UserInteractionCreate, UserInteractionResponse
from app.services.user_interaction import InteractionService
from app.prisma_client import prisma as db
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

@router.get("/", response_model=List[UserInteractionResponse])
@cacheable(key_prefix="interactions", tags=["interactions"])
async def list_user_interactions(
    request: Request,
    user_id: Optional[int] = Query(None),
    product_id: Optional[int] = Query(None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
):
    where = {}
    if user_id is not None:
        where["user_id"] = user_id
    if product_id is not None:
        where["product_id"] = product_id
    interactions = await db.userinteraction.find_many(
        where=where or None,
        skip=skip,
        take=limit,
        order={"timestamp": "desc"},
    )
    return interactions