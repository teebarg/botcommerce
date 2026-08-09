from core.notifications.models import Notification, NotificationChannel
from core.notifications.protocols import NotificationProvider


class NotificationService:
    def __init__(
        self,
        providers: dict[NotificationChannel, NotificationProvider],
    ):
        self.providers = providers

    async def send(self, notification: Notification) -> None:
        provider = self.providers.get(notification.channel)

        if not provider:
            raise ValueError(
                f"No provider configured for {notification.channel}"
            )

        await provider.send(notification)