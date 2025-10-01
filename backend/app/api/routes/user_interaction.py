from fastapi import APIRouter, Query, Body, Request, Depends
from typing import List, Optional
from app.schemas.user_interaction import UserInteractionCreate, UserInteractionResponse
from app.services.user_interaction import log_user_interaction
from app.prisma_client import prisma as db
from app.core.logging import get_logger
from app.services.redis import cache_response, invalidate_list
from app.core.deps import get_current_user

logger = get_logger(__name__)

router = APIRouter()

@router.post("/batch", dependencies=[Depends(get_current_user)])
async def batch_user_interactions(payload: List[UserInteractionCreate] = Body(...)):
    for item in payload:
        await log_user_interaction(
            user_id=item.user_id,
            product_id=item.product_id,
            type=item.type,
            metadata=item.metadata,
        )
    await invalidate_list("interactions")
    return {"message": "success"}

@router.get("/", response_model=List[UserInteractionResponse])
@cache_response("interactions")
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