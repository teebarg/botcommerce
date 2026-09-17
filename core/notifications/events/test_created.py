from dataclasses import dataclass

from core.notifications.base import (
    Mail,
    Mails,
    Notification,
    SlackMessage,
    WhatsAppMessage,
)


@dataclass(frozen=True)
class TestCreated(Notification):
    email: str

    def to_email(self) -> Mails:
        return Mails(
            receipients=[self.email],
            mail=Mail(
                subject="Notification system test",
                template="test_created.html",
                data={
                    "message": "Notification system is working!",
                },
            ),
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
