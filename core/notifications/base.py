from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any


class Channel(StrEnum):
    EMAIL = "email"
    SLACK = "slack"
    PUSH = "push"
    WHATSAPP = "whatsapp"


@dataclass
class Mail:
    subject: str
    template: str
    data: dict[str, Any] = field(default_factory=dict)
    cc: str | list[str] | None = None

@dataclass
class CampaignProduct:
    name: str
    image: str
    price: float
    old_price: float | None = None
    url: str = ""

@dataclass
class PushSubscription:
    endpoint: str
    p256dh: str
    auth: str
 
 
@dataclass
class Push:
    subscriptions: list[PushSubscription]
    title: str
    body: str
    path: str | None = None
    imageUrl: str | None = None
    data: dict[str, Any] = field(default_factory=dict)


@dataclass
class Mails:
    receipients: list[str]
    mail: Mail


@dataclass(frozen=True)
class SlackMessage:
    message: str


@dataclass(frozen=True)
class WhatsAppMessage:
    to: str
    message: str


class Notification(ABC):
    @abstractmethod
    def to_email(self) -> Mails:
        raise NotImplementedError

    def to_slack(self) -> SlackMessage | None:
        raise None

    def to_push(self) -> Push | None:
        raise None

    def to_whatsapp(self) -> WhatsAppMessage | None:
        raise None