from dataclasses import dataclass
from datetime import datetime

from core.notifications.base import (
    Mail,
    Mails,
    Notification,
)


@dataclass(frozen=True)
class NewsletterEvent(Notification):
    customer_email: str

    def to_email(self) -> Mails:
        return Mails(
            receipients=[self.customer_email],
            mail=Mail(
                to=self.customer_email,
                subject="Welcome to our newsletter",
                template="newsletter.html",
                data={
                    "unsubscribe_link": "",
                    "current_year": datetime.now().year,
                },
            ),
        )
