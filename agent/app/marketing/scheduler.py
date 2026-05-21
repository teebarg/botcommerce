from __future__ import annotations
import asyncio
import uuid
from celery import Celery
from celery.schedules import crontab
from app.config import get_model_name, settings
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
        log_notification_sent,
    )
    from app.observability.langfuse_client import create_trace, flush_langfuse

    notification_id = str(uuid.uuid4())
    logger.info(f"[Marketing] Starting notification run {notification_id}")

    # Start a trace for this entire marketing run
    trace = create_trace(
        name="marketing_push_run",
        session_id=notification_id,
        metadata={"notification_id": notification_id},
        tags=["marketing", "scheduled"],
    )

    try:
        fetch_span = trace.span(name="fetch_data")
        subscribers = await get_active_subscribers()
        products = await get_recent_products()
        fetch_span.end(output={
            "subscriber_count": len(subscribers),
            "product_count": len(products),
        })

        if not subscribers:
            logger.info("[Marketing] No active subscribers — skipping run")
            trace.update(output={"skipped": True, "reason": "no_subscribers"})
            return

        if not products:
            logger.info("[Marketing] No products — skipping run")
            trace.update(output={"skipped": True, "reason": "no_content"})
            return

        # --- LLM copy generation ---
        copy_span = trace.span(
            name="generate_copy",
            input={
                "product_count": len(products),
            },
        )
        import time
        _t0 = time.monotonic()
        # Generate copy with LLM
        copy = await generate_notification_copy(products)
        _copy_ms = (time.monotonic() - _t0) * 1000
        copy_span.end(
            output={"title": copy["title"], "body": copy["body"]},
            metadata={"latency_ms": round(_copy_ms, 1)},
        )

        # Record LLM generation against the trace
        trace.generation(
            name="marketing_copy",
            model=get_model_name(),
            input={"products": products[:3]},
            output=copy,
            metadata={"latency_ms": round(_copy_ms, 1)},
        )

        payload = {
            "title": copy["title"],
            "body": copy["body"],
            "url": copy.get("url", "/collections"),
            "notification_id": notification_id,
        }

        # --- Push delivery ---
        delivery_span = trace.span(
            name="send_notifications",
            input={
                "subscriber_count": len(subscribers),
                "payload": payload,
            },
        )
        _t1 = time.monotonic()
        # Send in batches
        stats = await send_notification_batch(subscribers, payload)
        _delivery_ms = (time.monotonic() - _t1) * 1000
        delivery_span.end(
            output=stats,
            metadata={"latency_ms": round(_delivery_ms, 1)},
        )

        # --- Scores ---
        total = len(subscribers)
        delivery_rate = stats["sent"] / total if total > 0 else 0
        failure_rate = stats["failed"] / total if total > 0 else 0

        trace.score(
            name="delivery_rate",
            value=round(delivery_rate, 3),
            comment=f"{stats['sent']}/{total} delivered",
        )
        trace.score(
            name="failure_rate",
            value=round(failure_rate, 3),
            comment=f"{stats['failed']} failed, {stats['expired']} expired",
        )

        # --- DB log + trace finalisation ---
        await log_notification_sent(
            subscriber_id=0,
            notification_id=notification_id,
            status="completed",
            error=f"sent={stats['sent']} failed={stats['failed']} expired={stats['expired']}",
        )

        trace.update(
            output={
                "notification_id": notification_id,
                "copy": copy,
                "stats": stats,
            },
            metadata={
                "total_subscribers": total,
                "delivery_rate": round(delivery_rate, 3),
                "total_latency_ms": round(_copy_ms + _delivery_ms, 1),
            },
        )

        logger.info(
            f"[Marketing] Run {notification_id} complete: "
            f"{stats['sent']} sent, {stats['failed']} failed, "
            f"{stats['expired']} expired subscriptions"
        )
    except Exception as e:
        trace.update(
            output={"error": str(e)},
            metadata={"status": "failed"},
        )
        logger.error(f"[Marketing] Run {notification_id} failed: {e}", exc_info=True)
        raise

    finally:
        # Always flush — Celery tasks don't share the FastAPI lifespan
        flush_langfuse()
