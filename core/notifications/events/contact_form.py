from core.config import settings
from datetime import datetime
from dataclasses import dataclass
from decimal import Decimal
from typing import Any

from core.notifications.base import (
    Mail,
    Notification,
    SlackMessage,
    WhatsAppMessage,
)


@dataclass(frozen=True)
class ContactForm(Notification):
    name: str
    email: str
    phone: str
    message: str

    def to_email(self) -> Mail:
        return Mail(
            to=settings.CONTACT_EMAIL,
            subject="New Contact Email",
            template="contact_form.html",
            data={
                "name": self.name,
                "email": self.email,
                "phone": self.phone,
                "message": self.message,
                "current_year": datetime.now().year,
            },
        )

    def to_slack(self) -> SlackMessage:
        return SlackMessage(
            message=(
                "📇 *New Emquiry*\n"
                f"*Name:* {self.name}\n"
                f"*Email:* {self.email}\n"
                f"*Phone:* {self.phone}\n"
                f"*Message:* ₦{self.message}"
            )
        )
