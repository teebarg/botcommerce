import asyncio
import json
from dataclasses import dataclass
from typing import Any

from pywebpush import WebPushException, webpush

from core.logging import get_logger
from core.notifications.base import Push, PushSubscription

logger = get_logger(__name__)

@dataclass
class PushDetails:
    title: str
    body: str
    path: str | None = None
    imageUrl: str | None = None
    data: dict[str, Any] = None


class PushSubscriptionExpired(Exception):
    """Raised when the push service reports the subscription no longer exists (404/410).

    Callers should catch this and remove the subscription from storage.
    """

    def __init__(self, subscription: PushSubscription):
        self.subscription = subscription
        super().__init__(f"Push subscription expired: {subscription.endpoint}")


class PushChannel:
    def __init__(
        self,
        *,
        vapid_private_key: str,
        vapid_claims_sub: str,
        ttl: int = 60 * 60 * 24,  # seconds the push service should retain the message
        max_concurrency: int = 20,
    ):
        self.vapid_private_key = vapid_private_key
        self.vapid_claims_sub = vapid_claims_sub
        self.ttl = ttl
        self._semaphore = asyncio.Semaphore(max_concurrency)

    async def send_one(self, details: PushDetails, subscription: PushSubscription) -> None:
        payload = json.dumps(
            {
                "title": details.title,
                "body": details.body,
                "path": details.path,
                "imageUrl": details.imageUrl,
                "data": details.data,
            }
        )

        subscription_info = {
            "endpoint": subscription.endpoint,
            "keys": {
                "p256dh": subscription.p256dh,
                "auth": subscription.auth,
            },
        }

        vapid_claims = {"sub": self.vapid_claims_sub}

        async with self._semaphore:
            try:
                await asyncio.to_thread(
                    webpush,
                    subscription_info=subscription_info,
                    data=payload,
                    vapid_private_key=self.vapid_private_key,
                    vapid_claims=vapid_claims,
                    ttl=self.ttl,
                )
            except WebPushException as exc:
                status = exc.response.status_code if exc.response is not None else None

                if status in (404, 410):
                    logger.info(
                        "Push subscription gone (%s): %s", status, subscription.endpoint
                    )
                    raise PushSubscriptionExpired(subscription) from exc

                logger.error("Push send failed (%s): %s", status, exc)
                raise

    async def send(self, push: Push) -> list[Exception | None]:
        """Send to many subscribers concurrently (bounded by max_concurrency).
        """
        results = await asyncio.gather(
            *(self.send_one(details=push, subscription=sub) for sub in push.subscriptions),
            return_exceptions=True,
        )
        return [result if isinstance(result, Exception) else None for result in results]
