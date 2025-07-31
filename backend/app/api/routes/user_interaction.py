from fastapi import APIRouter, HTTPException, Query, Body, Request
from typing import List, Optional
from app.schemas.user_interaction import UserInteractionCreate, UserInteractionResponse
from app.services.user_interaction import log_user_interaction
from app.prisma_client import prisma as db
from app.core.logging import logger
from app.services.redis import cache_response
from app.core.deps import (
    RedisClient
)

router = APIRouter()

@router.post("/", response_model=UserInteractionResponse)
async def create_user_interaction(payload: UserInteractionCreate, redis: RedisClient):
    try:
        interaction = await log_user_interaction(
            user_id=payload.user_id,
            product_id=payload.product_id,
            type=payload.type,
            metadata=payload.metadata,
        )
        await redis.invalidate_list_cache("interactions")
        return interaction
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/batch", response_model=List[UserInteractionResponse])
async def batch_user_interactions(redis: RedisClient, payload: List[UserInteractionCreate] = Body(...)):
    results = []
    for item in payload:
        interaction = await log_user_interaction(
            user_id=item.user_id,
            product_id=item.product_id,
            type=item.type,
            metadata=item.metadata,
        )
        results.append(interaction)
    await redis.invalidate_list_cache("interactions")
    return results

@router.get("/", response_model=List[UserInteractionResponse])
@cache_response("interactions")
async def list_user_interactions(
    request: Request,
    user_id: Optional[int] = Query(None),
    product_id: Optional[int] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
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