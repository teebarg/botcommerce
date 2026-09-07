from dataclasses import dataclass
from datetime import datetime
from typing import Any

from core.notifications.base import (
    Mail,
    Notification,
    SlackMessage,
)


@dataclass(frozen=True)
class AbandonedCartEvent(Notification):
    cart_data: Any
    user_name: str | None
    customer_email: str

    def to_email(self) -> Mail:
        return Mail(
            to=self.customer_email,
            subject="You left something in your cart",
            template="abandoned_cart.html",
            data={
                "user_name": self.user_name or "Customer",
                "user_email": self.customer_email,
                "cart": self.cart_data,
                "header_title": "You left something in your cart",
                "current_year": datetime.now().year,
            },
        )

    def to_slack(self) -> SlackMessage:
        return SlackMessage(
            message=(
                "🛍️ You left something in your cart*\n"
                f"*Username:* {self.user_name}\n"
                f"*Email:* {self.customer_email}\n"
            )
        )
