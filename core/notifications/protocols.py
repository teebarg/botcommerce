# core/notifications/protocols.py

from typing import Protocol
from core.notifications.models import Notification


class NotificationProvider(Protocol):
    async def send(self, notification: Notification) -> None:
        ...