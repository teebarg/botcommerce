import asyncio
import json
from dataclasses import dataclass
from typing import TypedDict

from app.core.logging import get_logger
from pywebpush import WebPushException, webpush

from app.core.config import settings

logger = get_logger(__name__)

_VAPID_PRIVATE_KEY: str = settings.VAPID_PRIVATE_KEY
_VAPID_CLAIMS: dict[str, str] = {"sub": f"mailto:{settings.ADMIN_EMAIL}"}


class Subscriber(TypedDict):
    id: str
    endpoint: str
    p256dh: str
    auth: str


class Notification(TypedDict):
    title: str
    body: str
    path: str
    data: dict | None
    image: str | None
    notificationId: str | None


@dataclass
class DispatchResult:
    sent: list[str]
    failed: list[str]
    expired: list[str]

    @property
    def total(self) -> int:
        return len(self.sent) + len(self.failed) + len(self.expired)


def _build_payload(subscriber: Subscriber, notification: Notification) -> str:
    return json.dumps({
        "title": notification["title"],
        "body": notification["body"],
        "path": notification.get("path", "/collections"),
        "data": notification.get("data"),
        "imageUrl": notification.get("image"),
        "notificationId": notification.get("notificationId"),
        "subscriberId": subscriber.get("id"),
    })


def _validate_subscriber(subscriber: Subscriber) -> None:
    missing = [k for k in ("endpoint", "p256dh", "auth") if not subscriber.get(k)]
    if missing:
        raise ValueError(f"Subscriber {subscriber.get('id')} missing fields: {missing}")


async def _send_one(
    subscriber: Subscriber,
    notification: Notification,
    result: DispatchResult,
    semaphore: asyncio.Semaphore,
) -> None:
    subscriber_id = subscriber.get("id")

    async with semaphore:  # Caps concurrent outbound connections
        try:
            _validate_subscriber(subscriber)
            payload = _build_payload(subscriber, notification)

            await asyncio.to_thread(  # webpush is sync — run in thread pool
                webpush,
                subscription_info={
                    "endpoint": subscriber["endpoint"],
                    "keys": {
                        "p256dh": subscriber["p256dh"],
                        "auth": subscriber["auth"],
                    },
                },
                data=payload,
                vapid_private_key=_VAPID_PRIVATE_KEY,
                vapid_claims=_VAPID_CLAIMS,
            )
            result.sent.append(subscriber_id)

        except WebPushException as ex:
            if ex.response is not None and ex.response.status_code == 410:
                result.expired.append(subscriber_id)
                logger.warning(
                    "Subscription expired (410) subscriber_id=%s — should be removed",
                    subscriber_id,
                )
            else:
                result.failed.append(subscriber_id)
                logger.error(
                    "WebPush failed subscriber_id=%s status=%s error=%s",
                    subscriber_id,
                    ex.response.status_code if ex.response else "no_response",
                    ex,
                )

        except ValueError as ex:
            result.failed.append(subscriber_id)
            logger.error("Invalid subscriber data subscriber_id=%s error=%s", subscriber_id, ex)

        except Exception as ex:
            result.failed.append(subscriber_id)
            logger.exception(
                "Unexpected error sending push subscriber_id=%s error=%s", subscriber_id, ex
            )


async def send_notifications_to_subscribers(
    subscriptions: list[Subscriber],
    notification: Notification,
    max_concurrency: int = 50,
) -> DispatchResult:
    """
    Send web push notifications concurrently.
    Returns a DispatchResult with sent/failed/expired subscriber IDs.
    """
    if not subscriptions:
        logger.info("send_notifications called with empty subscriptions list, skipping")
        return DispatchResult(sent=[], failed=[], expired=[])

    result = DispatchResult(sent=[], failed=[], expired=[])
    semaphore = asyncio.Semaphore(max_concurrency)

    tasks = [
        _send_one(subscriber, notification, result, semaphore)
        for subscriber in subscriptions
    ]
    await asyncio.gather(*tasks)

    logger.info(
        "Notification dispatch complete total=%d sent=%d failed=%d expired=%d",
        result.total,
        len(result.sent),
        len(result.failed),
        len(result.expired),
    )

    return result