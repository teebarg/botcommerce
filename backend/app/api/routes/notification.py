from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.dependencies.cache import ArqDep
from app.core.deps import UserDep
from app.core.logging import get_logger
from app.models.generic import Message
from app.prisma_client import DbDep


class PushMessageSchema(BaseModel):
    title: str
    body: str
    imageUrl: Optional[str] = None
    path: Optional[str] = None


class FCMIn(BaseModel):
    endpoint: str
    p256dh: str
    auth: str


logger = get_logger(__name__)

router = APIRouter()


@router.post("/push-fcm")
async def push_fcm(db: DbDep, data: FCMIn, user: UserDep) -> Message:
    try:
        await db.pushsubscription.upsert(
            where={"endpoint": data.endpoint},
            data={
                "create": {
                    "p256dh": data.p256dh,
                    "auth": data.auth,
                    "endpoint": data.endpoint,
                    "userId": user.id if user else None,
                },
                "update": {
                    "p256dh": data.p256dh,
                    "auth": data.auth,
                    "userId": user.id if user else None,
                },
            },
        )
    except Exception as e:
        logger.error(f"Failed to create subs: {str(e)}")
        raise Exception(f"Database error: {str(e)}")
    return Message(message="success")


@router.post("/push")
async def send_push_notification(queue: ArqDep, db: DbDep, payload: PushMessageSchema) -> Message:
    try:
        subscription_ids = await db.pushsubscription.find_many()
        await queue.enqueue_job(
            "process_push_notification",
            payload=payload.model_dump(),
            subscription_ids=[s.id for s in subscription_ids],
        )
        return Message(message="success")
    except Exception as e:
        logger.error(f"Failed to send push notifications: {str(e)}")
        return Message(message="failed")
