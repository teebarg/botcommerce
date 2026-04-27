from app.core.config import settings
from app.core.notifications.service import NotificationService
from app.core.notifications.channels import EmailChannel, PushChannel, SlackChannel, WhatsAppChannel
from app.core.notifications.templates import TemplateEngine

_notification_service: NotificationService | None = None


def get_notification_service() -> NotificationService:
    if _notification_service is None:
        raise RuntimeError("NotificationService not initialized. Call init_notification_service() at startup.")
    return _notification_service


def init_notification_service() -> NotificationService:
    global _notification_service

    service = NotificationService(template_engine=TemplateEngine())

    service.register_channel("email", EmailChannel(
        smtp_host=settings.SMTP_HOST,
        smtp_port=settings.SMTP_PORT,
        username=settings.SMTP_USER,
        password=settings.SMTP_PASSWORD,
    ))

    service.register_channel("slack", SlackChannel(
        webhook_url=settings.SLACK_ALERTS,
    ))

    if getattr(settings, "WHATSAPP_TOKEN", None) and getattr(settings, "WHATSAPP_PHONE_NUMBER_ID", None):
        service.register_channel("whatsapp", WhatsAppChannel(
            token=settings.WHATSAPP_TOKEN,
            phone_number_id=settings.WHATSAPP_PHONE_NUMBER_ID,
        ))

    if getattr(settings, "VAPID_PRIVATE_KEY", None):
        push_channel = PushChannel()
        service.register_channel("push", push_channel)

    _notification_service = service
    return service