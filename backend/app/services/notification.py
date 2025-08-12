from abc import ABC, abstractmethod

import emails  # type: ignore
import requests

from app.core.config import settings
from app.core.logging import logger


class NotificationChannel(ABC):
    @abstractmethod
    def send(self, recipient: str, message: str, **kwargs) -> bool:
        """Send notification through the channel."""
        pass

class EmailChannel(NotificationChannel):
    def __init__(self, smtp_host: str, smtp_port: int, username: str, password: str):
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port
        self.username = username
        self.password = password

    def send(self, recipient: str, message: str, subject: str = "Notification", **kwargs) -> bool:
        try:
            if not settings.EMAILS_ENABLED:
                return
            message = emails.Message(
                subject=subject,
                html=message,
                mail_from=(settings.EMAILS_FROM_NAME, settings.EMAILS_FROM_EMAIL),
            )
            smtp_options = {"host": self.smtp_host, "port": self.smtp_port}
            if settings.SMTP_TLS:
                smtp_options["tls"] = True
            elif settings.SMTP_SSL:
                smtp_options["ssl"] = True
            if self.username:
                smtp_options["user"] = self.username
            if self.password:
                smtp_options["password"] = self.password
            response = message.send(to=recipient, smtp=smtp_options)
            logger.info(f"Send email result: {response}")

            return True
        except Exception as e:
            logger.error(f"Email sending failed: {str(e)}")
            return False

class SlackChannel(NotificationChannel):
    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url

    def send(self, recipient: str, message: str, slack_message: dict, **kwargs) -> bool:
        try:
            response = requests.post(self.webhook_url, json=slack_message)
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Slack notification failed: {str(e)}")
            return False

class WhatsAppChannel(NotificationChannel):
    def __init__(self, token: str, phone_number_id: str):
        self.token = token
        self.phone_number_id = phone_number_id

    def send(self, recipient: str, message: str, **kwargs) -> bool:
        try:
            if not recipient:
                return False
            url = f"https://graph.facebook.com/v17.0/{self.phone_number_id}/messages"
            headers = {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json",
            }
            payload = {
                "messaging_product": "whatsapp",
                "to": recipient,
                "type": "text",
                "text": {"preview_url": True, "body": message},
            }
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            return 200 <= response.status_code < 300
        except Exception as e:
            logger.error(f"WhatsApp notification failed: {str(e)}")
            return False

class SMSChannel(NotificationChannel):
    def __init__(self, api_key: str, api_secret: str, from_number: str):
        self.api_key = api_key
        self.api_secret = api_secret
        self.from_number = from_number

    def send(self, recipient: str, message: str, **kwargs) -> bool:
        # Implementation would depend on your SMS provider (e.g., Twilio, MessageBird)
        # This is a placeholder implementation
        try:
            # Make API call to SMS provider
            return True
        except Exception as e:
            logger.error(f"SMS sending failed: {str(e)}")
            return False

class NotificationService:
    def __init__(self):
        self.channels: dict[str, NotificationChannel] = {}

    def register_channel(self, channel_name: str, channel: NotificationChannel):
        """Register a new notification channel."""
        self.channels[channel_name] = channel

    def send_notification(self, channel_name: str, recipient: str = "", message: str = "", **kwargs) -> bool:
        """Send notification through specified channel."""
        channel = self.channels.get(channel_name)
        if not channel:
            raise ValueError(f"Channel {channel_name} not found")
        return channel.send(recipient, message, **kwargs)

# Usage example:
"""
# Initialize the notification service
notification_service = NotificationService()

# Configure and register email channel
email_channel = EmailChannel(
    smtp_host="smtp.gmail.com",
    smtp_port=587,
    username="your-email@gmail.com",
    password="your-password"
)
notification_service.register_channel("email", email_channel)

# Configure and register Slack channel
slack_channel = SlackChannel(webhook_url="https://hooks.slack.com/services/YOUR/WEBHOOK/URL")
notification_service.register_channel("slack", slack_channel)

# Send notifications
notification_service.send_notification(
    "email",
    "recipient@example.com",
    "Hello from the notification service!",
    subject="Test Notification"
)

notification_service.send_notification(
    "slack",
    "#general",
    "Hello from the notification service!"
)
"""
