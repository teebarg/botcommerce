import time
import asyncio
import dataclasses
from typing import Callable, Awaitable

from app.core.logging import logger
from app.core.notifications.channels import NotificationChannel
from app.core.notifications.events import (
    BaseNotificationEvent,
    InvoiceEvent,
    OrderConfirmedEvent,
    SendAbandonedCartEvent,
    SendPushNotificationEvent,
)
from app.core.notifications.templates import TemplateEngine


ChannelRouting = list[dict]


class NotificationService:
    def __init__(self, template_engine: TemplateEngine):
        self.channels: dict[str, NotificationChannel] = {}
        self.templates = template_engine
        self._registry: dict[type, dict] = {
            OrderConfirmedEvent: {
                "template": "order_confirmed",
                "channels": ["email", "slack"]
            },
            SendAbandonedCartEvent: {
                "template": "send_abandoned_cart",
                "channels": ["email", "push"]
            },
            SendPushNotificationEvent: {
                "template": "send_push_notification",
                "channels": ["push"]
            },
            InvoiceEvent: {
                "template": "send_invoice",
                "channels": ["email"]
            }
        }

    def register_channel(self, name: str, channel: NotificationChannel):
        self.channels[name] = channel


    async def dispatch(self, event: BaseNotificationEvent) -> dict[str, bool]:
        """
        Dispatch a notification event.
        Returns a result map e.g. {"email": True, "slack": False}.
        """
        event_type = type(event)
        handler_config = self._registry.get(event_type)

        if not handler_config:
            logger.warning(f"notification.no_handlers...event: {event_type.__name__}")
            return {}

        context = dataclasses.asdict(event)
        event_name = _event_to_template_name(event_type)
        if event_name is None:
            return

        try:
            message, send_kwargs = await self.templates.render(channel=handler_config["template"], event_name=event_name, context=context)
        except NotImplementedError as e:
            logger.error(f"NotImplementedError......{e}")
            return {}
        except Exception as e:
            logger.error(f"Exception......{e}")
            return {}

        tasks = []
        for channel in handler_config["channels"]:
            tasks.append(self._dispatch_single(channel, message, send_kwargs))

        results_list = await asyncio.gather(*tasks, return_exceptions=False)
        return dict[str, bool](results_list)


    async def _dispatch_single(self, channel_name, message, send_kwargs) -> tuple[str, bool]:
        channel = self.channels.get(channel_name)

        if not channel:
            return (channel_name, False)

        try:
            success = await channel.send(message=message, **send_kwargs)
        except Exception as e:
            logger.error(f"notification.send_exception for event {channel_name} ...{str(e)}")
            success = False

        logger.debug(f"notification.dispatched for {channel_name}, success: {success}")

        return (channel_name, success)

    async def send_notification(self, channel_name: str, recipient: str = "", message: str = "", **kwargs) -> bool:
        """Low-level send — use dispatch() for event-driven flows."""
        channel = self.channels.get(channel_name)
        if not channel:
            raise ValueError(f"Channel '{channel_name}' not registered")
        return await channel.send(recipient, message, **kwargs)


def _event_to_template_name(event_type: type) -> str | None:
    """OrderConfirmedEvent → 'order_confirmed'"""
    try:
        name = event_type.__name__
        if name.endswith("Event"):
            name = name[:-5]
        # CamelCase → snake_case
        import re
        return re.sub(r"(?<!^)(?=[A-Z])", "_", name).lower()
    except Exception as e:
        logger.error(e)
        return None
