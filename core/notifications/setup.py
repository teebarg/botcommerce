from pathlib import Path

from core.notifications.channels import (
    EmailChannel,
    SlackChannel,
    WhatsAppChannel,
)
from core.notifications.service import NotificationService
from core.config import settings


def create_notification_service() -> NotificationService:
    template_dir = (
        Path(__file__).resolve().parent / "templates"
    )

    return NotificationService(
        email=EmailChannel(
            host=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            sender=settings.EMAILS_FROM_EMAIL,
            template_dir=template_dir,
        ),
        slack=SlackChannel(
            webhook_url=settings.SLACK_WEBHOOK_URL,
        ),
        # whatsapp=WhatsAppChannel(
        #     access_token=settings.WHATSAPP_ACCESS_TOKEN,
        #     phone_number_id=settings.WHATSAPP_PHONE_NUMBER_ID,
        #     api_version=settings.WHATSAPP_API_VERSION,
        # ),
    )