from abc import ABC, abstractmethod

import httpx

from app.core.logging import logger
from app.core.notifications.utils.push import send_notifications_to_subscribers


class NotificationChannel(ABC):
    @abstractmethod
    async def send(self, recipient: str, message: str, **kwargs) -> bool:
        pass


class SlackChannel(NotificationChannel):
    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url

    async def send(self, recipient: str, message: str, **kwargs) -> bool:
        try:
            slack_payload = kwargs.get("slack_message")
            if not slack_payload:
                slack_payload = {"text": message}

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.webhook_url, 
                    json=slack_payload, 
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
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
            return True
        except Exception as e:
            logger.error(f"Push notification sending failed: {str(e)}")
            return False
 