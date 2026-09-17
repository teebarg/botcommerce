from dataclasses import dataclass
from typing import Any

from core.notifications import Mail
from core.notifications.base import (
    Mails,
    Notification,
    Push,
    PushSubscription,
)


@dataclass(frozen=True)
class PushEvent(Notification):
    subscriptions: list[PushSubscription]
    title: str
    body: str
    path: str | None = "/collections"
    imageUrl: str | None = None
    data: dict[str, Any] = None

    def to_email(self) -> Mails:
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


@dataclass(frozen=True)
class CampaignEvent(Notification):
    receipients: list[str]
    subject: str
    template: str
    data: dict[str, Any] = None

    def to_email(self) -> Mails:
        return Mails(
            receipients=self.receipients,
            mail=Mail(
                subject=self.subject,
                template=self.template,
                data=self.data
            )
        )
    