from datetime import datetime
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
class Welcome(Notification):
    shop_name: str
    coupon: Any
    first_name: str
    email_to: str

    def to_email(self) -> Mail:
        return Mail(
            to=self.customer_email,
            subject=f"Welcome to {self.shop_name or 'our shop'}",
            template="welcome.html",
            data={
                "order": self,
                "bank_details": self.bank_details,
                "order_items": self.order_items,
                "order_extra": self.order_extra,
                "order_url": self.order_url,
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

    # def to_slack(self) -> SlackMessage:
    #     return SlackMessage(
    #         message=(
    #             "🛍️ *New Order*\n"
    #             f"*Order:* {self.order_number}\n"
    #             f"*Customer:* {self.customer_name}\n"
    #             f"*Email:* {self.customer_email}\n"
    #             f"*Total:* ₦{self.total:,.2f}"
    #         )
    #     )

    # def to_whatsapp(self) -> WhatsAppMessage:
    #     return WhatsAppMessage(
    #         to=self.customer_phone,
    #         message=(
    #             "🛍️ New Order\n"
    #             f"Order: {self.order_number}\n"
    #             f"Customer: {self.customer_name}\n"
    #             f"Total: ₦{self.total:,.2f}"
    #         ),
    #     )