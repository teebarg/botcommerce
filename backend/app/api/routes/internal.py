from datetime import datetime, timedelta
import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from prisma.enums import CartStatus, OrderStatus
from app.core.dependencies.services import SettingsDep
from app.core.logging import get_logger
from app.core.dependencies.cache import CacheDep
from app.core.dependencies.order import OrderDep
from app.core.dependencies.product import ProductDep
from app.core.security import verify_internal_signature
from app.core.notifications.setup import get_notification_service
from app.utils.emails import generate_welcome_email
from app.prisma_client import DbDep

logger = get_logger(__name__)

router = APIRouter()


@router.post(
    "/orders/{order_id}/process-referral",
    include_in_schema=False,
    dependencies=[Depends(verify_internal_signature)],
)
async def internal_process_referral(order_id: int, srv: OrderDep):
    order = await srv.db.order.find_unique(where={"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    await srv.process_referral(order=order)
    return {"status": "ok", "order_id": order_id}


class TagsRequest(BaseModel):
    tags: list[str]


@router.post("/invalidate", dependencies=[Depends(verify_internal_signature)])
async def invalidate_tags(
    srv: CacheDep,
    payload: TagsRequest,
):
    await srv.invalidate(tags=payload.tags)

    return {"status": "ok"}
