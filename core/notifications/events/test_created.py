# core/notifications/events/test_created.py

from dataclasses import dataclass

from core.notifications.base import (
    Mail,
    Notification,
    SlackMessage,
    WhatsAppMessage,
)


@dataclass(frozen=True)
class TestCreated(Notification):
    email: str

    def to_email(self) -> Mail:
        return Mail(
            to=self.email,
            subject="Notification system test",
            template="test_created.html",
            data={
                "message": "Notification system is working!",
            },
        )

    def to_slack(self) -> SlackMessage:
        return SlackMessage(
            message="🧪 Notification system test — working!",
        )

    def to_whatsapp(self) -> WhatsAppMessage:
        return WhatsAppMessage(
            to=self.email,
            message="🧪 Notification system test — working!",
        )