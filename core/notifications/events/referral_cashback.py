from datetime import datetime
from dataclasses import dataclass
from typing import Any

from core.notifications.base import (
    Mail,
    Notification,
)


@dataclass(frozen=True)
class ReferralCashback(Notification):
    order: Any
    referral: str
    customer_email: str

    def to_email(self) -> Mail:
        return Mail(
            to=self.customer_email,
            subject="You just got paid!",
            template="referral_cashback.html",
            data={
                "referral": self.referral,
                "cash_back": self.order.discount_amount,
                "order_value": self.order.subtotal,
                "referred": self.order.user.first_name if self.order.user else "",
                "created_at": self.order.created_at,
                "current_year": datetime.now().year,
                "header_title": "You just got paid!",
                "cta_url": "account/referrals",
                "cta_text": "View My Wallet",
            },
        )
