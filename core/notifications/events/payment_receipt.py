from datetime import datetime
from dataclasses import dataclass
from decimal import Decimal
from typing import Any

from core.notifications.base import (
    Mail,
    Notification,
)


@dataclass(frozen=True)
class PaymentReceipt(Notification):
    order: Any
    first_name: str
    customer_email: str

    def to_email(self) -> Mail:
        return Mail(
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
        )
