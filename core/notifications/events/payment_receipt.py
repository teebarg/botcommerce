from dataclasses import dataclass
from datetime import datetime
from typing import Any

from core.notifications.base import (
    Mail,
    Mails,
    Notification,
)


@dataclass(frozen=True)
class PaymentReceipt(Notification):
    order: Any
    first_name: str
    customer_email: str

    def to_email(self) -> Mails:
        return Mails(
            receipients=[self.customer_email],
            mail=Mail(
                to=self.customer_email,
                subject=f"Receipt for order {self.order.order_number}",
                template="payment_receipt.html",
                data={
                    "order": self.order,
                    "first_name": self.first_name,
                    "header_title": "Order Invoice",
                    "cta_url": "/collections",
                    "current_year": datetime.now().year,
                },
            ),
        )
