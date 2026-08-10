from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any


class Channel(StrEnum):
    EMAIL = "email"
    SLACK = "slack"
    WHATSAPP = "whatsapp"


@dataclass
class Mail:
    to: str
    subject: str
    template: str
    data: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class SlackMessage:
    message: str


@dataclass(frozen=True)
class WhatsAppMessage:
    to: str
    message: str


class Notification(ABC):
    @abstractmethod
    def to_email(self) -> Mail:
        raise NotImplementedError

    def to_slack(self) -> SlackMessage | None:
        raise None

    def to_whatsapp(self) -> WhatsAppMessage | None:
        raise None