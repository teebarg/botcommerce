from app.services.notification import send_notifications_to_subscribers
from fastapi import APIRouter, BackgroundTasks
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel

from app.models.generic import Message
from app.core.logging import get_logger
from app.services.redis import redis_client
from app.prisma_client import prisma as db
from app.core.deps import UserDep

from typing import Optional, Literal
from datetime import datetime

class PushEventSchema(BaseModel):
    notificationId: str
    subscriberId: str
    eventType: Literal["DELIVERED", "OPENED", "CLICKED", "DISMISSED"]
    userAgent: Optional[str] = None
    deliveredAt: Optional[datetime] = None

class PushMessageSchema(BaseModel):
    title: str
    body: str
    image: Optional[str] = None
    path: Optional[str] = None

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
async def push_fcm(data: FCMIn, user: UserDep):
    await redis_client.xadd("FCM", jsonable_encoder(data, exclude_none=True))
    try:
        await db.pushsubscription.upsert(
            where={
                'endpoint': data.endpoint
            },
            data={
                "create": {
                    'p256dh': data.p256dh,
                    'auth': data.auth,
                    'endpoint': data.endpoint,
                    'userId': user.id
                },
                "update": {
                    'p256dh': data.p256dh,
                    'auth': data.auth,
                    'userId': user.id
                }
            }
        )
    except Exception as e:
        logger.error(f"Failed to create subs: {str(e)}")
        raise Exception(f"Database error: {str(e)}")
    return {"message": "success"}


@router.post("/push")
async def send_push_notification(data: PushMessageSchema, background_tasks: BackgroundTasks):
    try:
        subscriptions = await db.pushsubscription.find_many()
        logger.info(f"Found {len(subscriptions)} subscriptions")
        
        background_tasks.add_task(send_notifications_to_subscribers, subscriptions=[subscription.model_dump() for subscription in subscriptions], notification=data.model_dump())
        return {"message": "success"}
    except Exception as e:
        logger.error(f"Failed to send push notifications: {str(e)}")
        return {"message": "failed"}

