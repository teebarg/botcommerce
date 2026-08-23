import httpx

from core.notifications.base import WhatsAppMessage


class WhatsAppChannel:
    def __init__(
        self,
        *,
        access_token: str,
        phone_number_id: str,
        api_version: str = "v23.0",
        timeout: float = 5.0,
    ):
        self.access_token = access_token
        self.phone_number_id = phone_number_id
        self.api_version = api_version
        self.timeout = timeout

    async def send(
        self,
        message: WhatsAppMessage,
    ) -> None:
        url = (
            f"https://graph.facebook.com/"
            f"{self.api_version}/"
            f"{self.phone_number_id}/messages"
        )

        async with httpx.AsyncClient(
            timeout=self.timeout,
        ) as client:
            response = await client.post(
                url,
                headers={
                    "Authorization": (
                        f"Bearer {self.access_token}"
                    ),
                    "Content-Type": "application/json",
                },
                json={
                    "messaging_product": "whatsapp",
                    "to": message.to,
                    "type": "text",
                    "text": {
                        "body": message.message,
                    },
                },
            )

            response.raise_for_status()