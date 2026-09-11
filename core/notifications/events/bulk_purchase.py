from dataclasses import dataclass
from datetime import datetime

from core.config import settings
from core.notifications.base import (
    Mail,
    Notification,
    SlackMessage,
)


@dataclass(frozen=True)
class BulkPurchaseEvent(Notification):
    name: str
    email: str
    phone: str
    message: str
    bulkType: str
    quantity: str | None

    def to_email(self) -> Mail:
        return Mail(
            to=settings.CONTACT_EMAIL,
            subject="New Bulk Purchase Inquiry",
            template="bulk_purchase.html",
            data={
                "name": self.name,
                "email": self.email,
                "phone": self.phone,
                "bulkType": self.bulkType,
                "quantity": self.quantity or "Not specified",
                "message": self.message or "No additional details provided",
                "header_title": "New enquiry on bulk purchase",
                "current_year": datetime.now().year,
            },
        )

    def to_slack(self) -> SlackMessage:
        return SlackMessage(
            message=(
                "📇 *Bulk Purchase Emquiry*\n"
                f"*Name:* {self.name}\n"
                f"*Email:* {self.email}\n"
                f"*Phone:* {self.phone}\n"
                f"*Bulk:* {self.bulkType}\n"
                f"*Quantity:* {self.quantity}\n"
                f"*Message:* {self.message}"
            )
        )
