from dataclasses import dataclass
from datetime import datetime
from typing import Any

from core.notifications.base import (
    Mail,
    Notification,
)


@dataclass(frozen=True)
class Welcome(Notification):
    coupon: Any
    first_name: str
    email_to: str

    def to_email(self) -> Mail:
        return Mail(
            to=self.email_to,
            subject="Welcome!",
            template="welcome.html",
            data={
                "first_name": self.first_name,
                "email": self.email_to,
                "current_year": datetime.now().year,
                "coupon": self.coupon,
                "header_title": "Welcome Gift Inside! 🎁",
                "header_subtitle": f"We're excited to have you here, {self.first_name}!!",
                "cta_url": "collections",
                "cta_text": "Start Shopping",
            },
        )
