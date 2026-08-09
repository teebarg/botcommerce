from dataclasses import dataclass
from enum import StrEnum


class NotificationChannel(StrEnum):
    EMAIL = "email"
    WHATSAPP = "whatsapp"
    SMS = "sms"


@dataclass
class Notification:
    channel: NotificationChannel
    recipient: str
    subject: str | None = None
    message: str = ""
    html: str | None = None