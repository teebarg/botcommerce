import time
import asyncio
import dataclasses
from typing import Callable, Awaitable

from app.core.logging import logger
from app.core.notifications.channels import (
    NotificationChannel,
    EmailChannel,
    SlackChannel,
    WhatsAppChannel,
)
from app.core.notifications.events import (
    BaseNotificationEvent,
    OrderConfirmedEvent,
    OrderShippedEvent,
    PasswordResetEvent,
    SendAbandonedCartEvent,
    SendPushNotificationEvent,
)
from app.core.notifications.templates import TemplateEngine


# Type alias for a handler
ChannelRouting = list[dict]  # [{"channel": "email", "recipient_key": "user_email", ...}]


class NotificationService:
    def __init__(self, template_engine: TemplateEngine):
        self.channels: dict[str, NotificationChannel] = {}
        self.templates = template_engine

        # Registry: maps event type → list of channel dispatch configs
        # which template, and any extra kwargs to pass.
        self._registry: dict[type, dict] = {
            SendAbandonedCartEvent: {
                "template": "send_abandoned_cart",
                "channels": ["email", "slack", "push"]
            },
            SendPushNotificationEvent: {
                "template": "send_push_notification",
                "channels": ["push"]
            },
        }

    def register_channel(self, name: str, channel: NotificationChannel):
        self.channels[name] = channel


    async def dispatch(self, event: BaseNotificationEvent) -> dict[str, bool]:
        """
        Dispatch a notification event.
        Looks up the registry, renders templates, and sends through all
        configured channels. Returns a result map e.g. {"email": True, "slack": False}.
        """
        logger.info("Sending notifications........................")
        # logger.info(event)
        logger.info("")
        event_type = type(event)
        handler_config = self._registry.get(event_type)

        if not handler_config:
            logger.warning("notification.no_handlers", extra={"event": event_type.__name__})
            return {}

        # Convert event to a plain dict for template rendering
        context = dataclasses.asdict(event)
        print("context........", context)
        event_name = _event_to_template_name(event_type)
        print("event_name........", event_name)
        if event_name is None:
            return

        try:
            message, send_kwargs = self.templates.render(handler_config["template"], event_name, context)
            logger.info("message......", message)
            logger.info("send_kwargs......", send_kwargs)
        except NotImplementedError as e:
            logger.info("NotImplementedError......")
            logger.info(e)
            return {}
        except Exception as e:
            logger.info("Exception......")
            logger.info(e)
            return {}

        tasks = []
        for channel in handler_config["channels"]:
            tasks.append(self._dispatch_single(event, channel, message, send_kwargs))
        
        results_list = await asyncio.gather(*tasks, return_exceptions=False)
        return dict[str, bool](results_list)


    async def _dispatch_single(self, event, channel_name, message, send_kwargs) -> tuple[str, bool]:
        channel = self.channels.get(channel_name)

        if not channel:
            return (channel_name, False)

        recipient = send_kwargs.get("recipient", "")

        # if recipient_field and not recipient:
        #     return (channel_name, False)

        # try:
        #     message, send_kwargs = self.templates.render(channel_name, event_name, context)
        # except NotImplementedError:
        #     return (channel_name, False)

        start = time.monotonic()
        try:
            success = await channel.send(recipient=recipient, message=message, **send_kwargs)
        except Exception as e:
            logger.error("notification.send_exception", extra={
                "channel": channel_name,
                "event": type(event).__name__,
                "error": str(e),
            })
            success = False

        logger.info("notification.dispatched", extra={
            "channel": channel_name,
            "event": type(event).__name__,
            "success": success,
            "duration_ms": round((time.monotonic() - start) * 1000),
        })

        return (channel_name, success)

    async def send_notification(self, channel_name: str, recipient: str = "", message: str = "", **kwargs) -> bool:
        """Low-level send — use dispatch() for event-driven flows."""
        channel = self.channels.get(channel_name)
        if not channel:
            raise ValueError(f"Channel '{channel_name}' not registered")
        return await channel.send(recipient, message, **kwargs)


# ------------------------------------------------------------------ #
# Helpers
# ------------------------------------------------------------------ #

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
