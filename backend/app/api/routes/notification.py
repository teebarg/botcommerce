from fastapi import APIRouter
from app.models.generic import Message
from app.core.logging import get_logger
from app.services.redis import redis_client
from app.prisma_client import prisma as db

from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder

class PushEventSchema(BaseModel):
    notificationId: str
    subscriberId: str
    eventType: Literal["DELIVERED", "OPENED", "CLICKED", "DISMISSED"]
    userAgent: Optional[str] = None
    deliveredAt: Optional[datetime] = None

class FCMIn(BaseModel):
    endpoint: str
    p256dh: str
    auth: str

logger = get_logger(__name__)

router = APIRouter()

@router.post("/push-event")
async def create_push_event(data: PushEventSchema):
    await redis_client.xadd("PUSH_EVENT", jsonable_encoder(data, exclude_none=True))
    return Message(message="success")


@router.post("/push-fcm")
async def push_fcm(data: FCMIn):
    await redis_client.xadd("FCM", jsonable_encoder(data, exclude_none=True))
    try:
        await db.pushsubscription.create(data={**data.model_dump()})
    except Exception as e:
        logger.error(f"Failed to create subs: {str(e)}")
        raise Exception(f"Database error: {str(e)}")
    return {"message": "success"}
