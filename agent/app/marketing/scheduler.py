from __future__ import annotations
import asyncio
import uuid
from celery import Celery
from celery.schedules import crontab
from app.config import settings
from app.logging import get_logger

logger = get_logger(__name__)

celery_app = Celery(
    "marketing",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.beat_schedule = {
    "send-marketing-notifications": {
        "task": "app.marketing.scheduler.send_marketing_push",
        "schedule": crontab(minute=0, hour="*/6"),  # every 6 hours
    },
}

celery_app.conf.timezone = "Africa/Lagos"


@celery_app.task(
    name="app.marketing.scheduler.send_marketing_push",
    bind=True,
    max_retries=3,
    default_retry_delay=300,  # retry after 5 minutes on failure
)
def send_marketing_push(self):
    """
    Celery task: generate and send marketing push notifications.
    Runs every 6 hours via celery beat.
    """
    try:
        asyncio.run(_run_marketing_agent())
    except Exception as exc:
        logger.error(f"[Marketing Scheduler] Task failed: {exc}", exc_info=True)
        raise self.retry(exc=exc)


async def _run_marketing_agent():
    """Async core of the marketing task."""
    from app.marketing.agent import generate_notification_copy
    from app.marketing.push import send_notification_batch
    from app.marketing.db import (
        get_active_subscribers,
        get_recent_products,
        get_active_promotions,
        log_notification_sent,
    )

    notification_id = str(uuid.uuid4())
    logger.info(f"[Marketing] Starting notification run {notification_id}")

    subscribers = await get_active_subscribers()
    if not subscribers:
        logger.info("[Marketing] No active subscribers — skipping run")
        return

    products = await get_recent_products()
    promotions = await get_active_promotions()

    if not products and not promotions:
        logger.info("[Marketing] No products or promotions — skipping run")
        return

    # Generate copy with LLM
    copy = await generate_notification_copy(products, promotions)

    payload = {
        "title": copy["title"],
        "body": copy["body"],
        "url": copy.get("url", "/collections"),
        "notification_id": notification_id,
    }

    # Send in batches
    stats = await send_notification_batch(subscribers, payload)

    # Log results
    await log_notification_sent(
        subscriber_id=0,  # 0 = batch summary record
        notification_id=notification_id,
        status="completed",
        error=f"sent={stats['sent']} failed={stats['failed']} expired={stats['expired']}",
    )

    logger.info(
        f"[Marketing] Run {notification_id} complete: "
        f"{stats['sent']} sent, {stats['failed']} failed, "
        f"{stats['expired']} expired subscriptions"
    )
