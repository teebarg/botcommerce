from dataclasses import dataclass
from datetime import datetime
from typing import Any

from core.notifications.base import (
    Mail,
    Notification,
    Push,
    PushSubscription,
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

    def to_push(self) -> Push:
        return Push(
            subscription=PushSubscription(
                endpoint=self.endpoint,
                p256dh=self.p256dh,
                auth=self.auth,
            ),
            title=self.title,
            body=self.body,
            path=self.path or "/collections",
            imageUrl=self.imageUrl,
            data={
                "actionUrl": "/collections",
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
