from __future__ import annotations

import asyncio
from collections.abc import Sequence

from core.logging import get_logger
from core.notifications.base import (
    Channel,
    Notification,
)
from core.notifications.channels import (
    EmailChannel,
    PushChannel,
    SlackChannel,
)

logger = get_logger(__name__)


class NotificationService:
    def __init__(
        self,
        *,
        email: EmailChannel,
        slack: SlackChannel,
        push: PushChannel,
        # whatsapp: Optional[WhatsAppChannel],
        shop_settings: dict[str, str],
    ):
        self.email = email
        self.slack = slack
        self.push = push
        # self.whatsapp = whatsapp
        self.shop_settings = shop_settings

    async def send(
        self,
        notification: Notification,
        channels: Sequence[Channel],
    ) -> None:
        tasks = []
        ordered_channels = []

        for channel in channels:
            match channel:
                case Channel.EMAIL:
                    mail = notification.to_email()

                    if mail:
                        mail.data = {
                            "shop": self.shop_settings,
                            **mail.data,
                        }

                        tasks.append(
                            self.email.send(mail)
                        )
                        ordered_channels.append(channel)

                case Channel.SLACK:
                    tasks.append(
                        self.slack.send(
                            notification.to_slack()
                        )
                    )
                    ordered_channels.append(channel)

                case Channel.PUSH:
                    tasks.append(
                        self.push.send(
                            notification.to_push()
                        )
                    )
                    ordered_channels.append(channel)

                # case Channel.WHATSAPP:
                #     tasks.append(
                #         self.whatsapp.send(
                #             notification.to_whatsapp()
                #         )
                #     )

                case _:
                    raise ValueError(
                        f"Unsupported notification channel: {channel}"
                    )

        if not tasks:
            return {}

        results = await asyncio.gather(
            *tasks,
            return_exceptions=True,
        )

        errors = [
            result
            for result in results
            if isinstance(result, Exception)
        ]

        if errors:
            for error in errors:
                logger.exception(
                    "Notification channel failed",
                    exc_info=error,
                )

            raise errors[0]
        return dict(zip(ordered_channels, results))
