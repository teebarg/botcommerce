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


class EmailCampaignSchema(BaseModel):
    subject: str
    heading: str | None = None
    intro: str | None = None
    hero_image: str | None = None
    product_ids: list[int]
    trust_note: str | None = None
    cta_text: str | None = "Shop Now"
    cta_url: str | None = "/collections"
    eyebrow: str | None = ""
    preheader: str | None = ""
    urgency_text: str | None = "🔥 FLASH SALE — 48 HOURS ONLY"
    trust_badges: list[str] = None


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


@router.post("/email-campaign")
async def send_email_campaign(
    queue: ArqDep, db: DbDep, payload: EmailCampaignSchema
) -> Message:
    try:
        await queue.enqueue_job(
            "process_email_campaign",
            subject=payload.subject,
            heading=payload.heading,
            intro=payload.intro,
            hero_image=payload.hero_image,
            product_ids=payload.product_ids,
        )
        return Message(message="success")
    except Exception as e:
        logger.error(f"Failed to enqueue email campaign: {str(e)}")
        return Message(message="failed")
