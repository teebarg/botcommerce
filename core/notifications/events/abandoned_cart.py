from typing import Optional
from datetime import datetime
from dataclasses import dataclass
from typing import Any

from core.notifications.base import (
    Mail,
    Notification,
    SlackMessage,
)


@dataclass(frozen=True)
class AbandonedCartEvent(Notification):
    cart_data: Any
    user_name: Optional[str]
    customer_email: str

    def to_email(self) -> Mail:
        return Mail(
            to=self.customer_email,
            subject="Don't forget your items!",
            template="abandoned_cart.html",
            data={
                "user_name": self.user_name or "Customer",
                "user_email": self.customer_email,
                "cart": self.cart_data,
                "header_title": "Don't forget your items!",
                "current_year": datetime.now().year,
            },
        )

    def to_slack(self) -> SlackMessage:
        return SlackMessage(
            message=(
                "🛍️ Don't forget your items!*\n"
                f"*Username:* {self.user_name}\n"
                f"*Email:* {self.customer_email}\n"
            )
        )
