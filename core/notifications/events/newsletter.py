from datetime import datetime
from dataclasses import dataclass

from core.notifications.base import (
    Mail,
    Notification,
)


@dataclass(frozen=True)
class NewsletterEvent(Notification):
    customer_email: str

    def to_email(self) -> Mail:
        return Mail(
            to=self.customer_email,
            subject="Welcome to our newsletter",
            template="newsletter.html",
            data={
                "unsubscribe_link": "",
                "current_year": datetime.now().year,
            },
        )
