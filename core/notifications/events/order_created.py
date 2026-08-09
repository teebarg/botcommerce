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
class OrderCreated(Notification):
    order_number: str
    customer_name: str
    customer_email: str
    customer_phone: str
    total: Decimal

    bank_details: dict[str, str]
    order_items: list[dict[str, Any]]
    order_extra: dict[str, Any] | None = None
    order_url: str | None = None

    def to_email(self) -> Mail:
        return Mail(
            to=self.customer_email,
            subject=f"Order {self.order_number} received",
            template="order_created.html",
            data={
                "order": self,
                "bank_details": self.bank_details,
                "order_items": self.order_items,
                "order_extra": self.order_extra,
                "order_url": self.order_url,
            },
        )

    def to_slack(self) -> SlackMessage:
        return SlackMessage(
            message=(
                "🛍️ *New Order*\n"
                f"*Order:* {self.order_number}\n"
                f"*Customer:* {self.customer_name}\n"
                f"*Email:* {self.customer_email}\n"
                f"*Total:* ₦{self.total:,.2f}"
            )
        )

    def to_whatsapp(self) -> WhatsAppMessage:
        return WhatsAppMessage(
            to=self.customer_phone,
            message=(
                "🛍️ New Order\n"
                f"Order: {self.order_number}\n"
                f"Customer: {self.customer_name}\n"
                f"Total: ₦{self.total:,.2f}"
            ),
        )