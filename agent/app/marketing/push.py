from __future__ import annotations
import asyncio
import json
from concurrent.futures import ThreadPoolExecutor
from pywebpush import webpush, WebPushException
from app.config import settings
from app.logging import get_logger

logger = get_logger(__name__)

# Thread pool for pywebpush — it's sync, run in executor
_executor = ThreadPoolExecutor(max_workers=10)

BATCH_SIZE = 100        # subscribers per batch
BATCH_DELAY = 1.0       # seconds between batches — don't hammer the push service


def _send_one(subscription: dict, payload: dict, vapid_private_key: str, vapid_claims: dict) -> tuple[bool, str | None]:
    """Send a single push notification synchronously."""
    try:
        webpush(
            subscription_info=subscription,
            data=json.dumps(payload),
            vapid_private_key=vapid_private_key,
            vapid_claims=vapid_claims,
        )
        return True, None
    except WebPushException as e:
        # 410 Gone = subscription expired, should be cleaned up
        # 404 Not Found = subscription no longer valid
        status_code = getattr(e.response, "status_code", None) if e.response else None
        return False, f"WebPushException [{status_code}]: {str(e)[:200]}"
    except Exception as e:
        return False, str(e)[:200]


async def send_notification_batch(
    subscribers: list[dict],
    payload: dict,
) -> dict[str, int]:
    """
    Send notifications to all subscribers in batches.
    Returns summary: {sent, failed, expired}
    """
    vapid_claims = {"sub": f"mailto:{settings.VAPID_CONTACT_EMAIL}"}

    stats = {"sent": 0, "failed": 0, "expired": 0}
    loop = asyncio.get_event_loop()

    # Process in batches to avoid overwhelming push services
    for i in range(0, len(subscribers), BATCH_SIZE):
        batch = subscribers[i:i + BATCH_SIZE]

        tasks = [
            loop.run_in_executor(
                _executor,
                _send_one,
                json.loads(sub["push_subscription"]),
                payload,
                settings.VAPID_PRIVATE_KEY,
                vapid_claims,
            )
            for sub in batch
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        for sub, result in zip(batch, results):
            if isinstance(result, Exception):
                stats["failed"] += 1
                logger.error(f"[Push] Unexpected error for subscriber {sub['id']}: {result}")
            else:
                success, error = result
                if success:
                    stats["sent"] += 1
                elif error and ("410" in error or "404" in error):
                    stats["expired"] += 1  # stale subscription
                    logger.info(f"[Push] Expired subscription for subscriber {sub['id']}")
                else:
                    stats["failed"] += 1
                    logger.warning(f"[Push] Failed for subscriber {sub['id']}: {error}")

        # Throttle between batches
        if i + BATCH_SIZE < len(subscribers):
            await asyncio.sleep(BATCH_DELAY)

    logger.info(f"[Push] Batch complete: {stats}")
    return stats