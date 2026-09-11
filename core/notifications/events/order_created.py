from dataclasses import dataclass
from datetime import datetime
from typing import Any

from core.notifications.base import (
    Mail,
    Notification,
    SlackMessage,
)


@dataclass(frozen=True)
class OrderCreated(Notification):
    order: Any
    first_name: str
    last_name: str
    customer_email: str
    total: float

    def to_email(self) -> Mail:
        header_title = "Your order has been created"
        template_name = "paid_invoice.html"

        if self.order.payment_method == "CASH_ON_DELIVERY":
            template_name = "pickup_invoice.html"
            header_title = "Your order has been processed"

        elif self.order.payment_status == "PENDING":
            header_title = "Your order is pending payment"
            template_name = "pending_invoice.html"

        elif self.order.payment_status == "FAILED":
            header_title = "Your order payment failed"
            template_name = "failed_invoice.html"

        return Mail(
            to=self.customer_email,
            subject=f"Order {self.order.order_number} received",
            template=template_name,
            data={
                "order": self.order,
                "first_name": self.first_name,
                "last_name": self.last_name,
                "current_year": datetime.now().year,
                "header_title": header_title,
                "cta_url": f"order/confirmed/{self.order.order_number}",
                "cta_text": "View Order",
            },
        )

    def to_slack(self) -> SlackMessage:
        return SlackMessage(
            message=(
                "🛍️ *New Order*\n"
                f"*Order:* {self.order.order_number}\n"
                f"*Customer:* {self.first_name} {self.last_name}\n"
                f"*Email:* {self.customer_email}\n"
                f"*Total:* ₦{self.total:,.2f}"
            )
        )

    # def to_whatsapp(self) -> WhatsAppMessage:
    #     return WhatsAppMessage(
    #         to=self.customer_phone,
    #         message=(
    #             "🛍️ New Order\n"
    #             f"Order: {self.order.order_number}\n"
    #             f"Customer: {self.first_name} {self.last_name}\n"
    #             f"Total: ₦{self.total:,.2f}"
    #         ),
    #     )