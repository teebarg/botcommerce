from dataclasses import dataclass
from typing import Any

from core.notifications import Mail
from core.notifications.base import (
    Notification,
    Push,
    PushSubscription,
)


@dataclass(frozen=True)
class PushEvent(Notification):
    subscriptions: list[PushSubscription]
    title: str
    body: str
    path: str | None = None
    imageUrl: str | None = None
    data: dict[str, Any] = None

    def to_email(self) -> Mail:
        return 
    

    def to_push(self) -> Push:
        return Push(
            subscriptions=self.subscriptions,
            title=self.title,
            body=self.body,
            path=self.path,
            imageUrl=self.imageUrl,
            data=self.data,
        )