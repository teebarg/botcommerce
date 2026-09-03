from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.dependencies.cache import CacheDep
from app.core.logging import get_logger
from app.core.security import verify_internal_signature

logger = get_logger(__name__)

router = APIRouter()


class TagsRequest(BaseModel):
    tags: list[str]


@router.post("/invalidate", dependencies=[Depends(verify_internal_signature)])
async def invalidate_tags(
    srv: CacheDep,
    payload: TagsRequest,
):
    await srv.invalidate(tags=payload.tags)

    return {"status": "ok"}
