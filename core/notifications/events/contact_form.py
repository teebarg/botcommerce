from dataclasses import dataclass
from datetime import datetime

from core.config import settings
from core.notifications.base import (
    Mail,
    Mails,
    Notification,
    SlackMessage,
)


@dataclass(frozen=True)
class ContactForm(Notification):
    name: str
    email: str
    phone: str
    message: str

    def to_email(self) -> Mails:
        return Mails(
            receipients=[settings.CONTACT_EMAIL],
            mail=Mail(
                subject="New Contact Email",
                template="contact_form.html",
                data={
                    "name": self.name,
                    "email": self.email,
                    "phone": self.phone,
                    "message": self.message,
                    "current_year": datetime.now().year,
                },
            ),
        )

    def to_slack(self) -> SlackMessage:
        return SlackMessage(
            message=(
                "📇 *New Emquiry*\n"
                f"*Name:* {self.name}\n"
                f"*Email:* {self.email}\n"
                f"*Phone:* {self.phone}\n"
                f"*Message:* {self.message}"
            )
        )
