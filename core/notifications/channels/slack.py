import httpx

from core.notifications.base import SlackMessage


class SlackChannel:
    def __init__(
        self,
        webhook_url: str,
        *,
        timeout: float = 5.0,
    ):
        self.webhook_url = webhook_url
        self.timeout = timeout

    async def send(self, message: SlackMessage) -> None:
        async with httpx.AsyncClient(
            timeout=self.timeout,
        ) as client:
            response = await client.post(
                self.webhook_url,
                json={
                    "text": message.message,
                },
            )

            response.raise_for_status()