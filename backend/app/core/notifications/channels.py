from app.core.notifications.utils.push import send_notifications_to_subscribers
import httpx
from abc import ABC, abstractmethod
from app.core.logging import logger
from app.core.utils import send_email


class NotificationChannel(ABC):
    @abstractmethod
    async def send(self, recipient: str, message: str, **kwargs) -> bool:
        pass


class EmailChannel(NotificationChannel):
    def __init__(self, smtp_host: str, smtp_port: int, username: str, password: str):
        self.smtp_host = smtp_host
        self.smtp_port = smtp_port
        self.username = username
        self.password = password


    async def send(self, recipient: str, message: str, cc_list: list[str] = [], **kwargs) -> bool:
        try:
            await send_email(
                email_to=recipient,
                subject=kwargs.get("subject", "Notification"),
                html_content=message,
                cc_list=cc_list,
            )
            return True
        except Exception as e:
            logger.error(f"Email sending failed: {str(e)}")
            return False


class SlackChannel(NotificationChannel):
    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url

    async def send(self, recipient: str, message: str, slack_message: dict, **kwargs) -> bool:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(self.webhook_url, json=slack_message, timeout=10)
            return response.status_code == 200
        except Exception as e:
            logger.error(f"slack.send_failed: {str(e)}")
            return False


class WhatsAppChannel(NotificationChannel):
    def __init__(self, token: str, phone_number_id: str):
        self.token = token
        self.phone_number_id = phone_number_id

    async def send(self, recipient: str, message: str, **kwargs) -> bool:
        if not recipient:
            return False
        try:
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
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, headers=headers, timeout=10)
            return 200 <= response.status_code < 300
        except Exception as e:
            logger.error(f"whatsapp.send_failed: {str(e)}")
            return False


class PushChannel(NotificationChannel):
    async def send(self, recipient: str, message: str, **kwargs) -> bool:
        try:
            await send_notifications_to_subscribers(subscriptions=kwargs.get("subscriptions", []), notification=kwargs.get("notification", {}))
        except Exception as e:
            logger.error(f"Push notification sending failed: {str(e)}")
            return False
 