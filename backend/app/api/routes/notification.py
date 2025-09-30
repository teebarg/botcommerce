from fastapi import APIRouter
from app.models.generic import Message
from app.core.logging import get_logger
from app.services.redis import redis_client

from typing import Optional, Literal
from datetime import datetime
from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder

class PushEventSchema(BaseModel):
    notificationId: str
    subscriberId: str
    eventType: Literal["DELIVERED", "OPENED", "CLICKED", "DISMISSED"]
    platform: str
    deviceType: Literal["WEB", "IOS", "ANDROID", "DESKTOP"]
    userAgent: Optional[str] = None
    deliveredAt: Optional[datetime] = None
    readAt: Optional[datetime] = None

class FCMIn(BaseModel):
    endpoint: str
    p256dh: str
    auth: str

logger = get_logger(__name__)

router = APIRouter()

@router.post("/push-event")
async def create_push_event(data: PushEventSchema):
    logger.error(data)
    await redis_client.xadd("PUSH_EVENT", jsonable_encoder(data, exclude_none=True))
    return Message(message="success")


@router.post("/push-fcm")
async def push_fcm(data: FCMIn):
    logger.error(data)
    await redis_client.xadd("FCM", jsonable_encoder(data, exclude_none=True))
    return {"message": "success"}
