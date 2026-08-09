from __future__ import annotations

import asyncio
import logging
from typing import Optional
from collections.abc import Sequence

from core.notifications.base import (
    Channel,
    Notification,
)
from core.notifications.channels import (
    EmailChannel,
    SlackChannel,
    WhatsAppChannel,
)
from core.logging import get_logger


logger = get_logger(__name__)


class NotificationService:
    def __init__(
        self,
        *,
        email: EmailChannel,
        slack: SlackChannel,
        # whatsapp: Optional[WhatsAppChannel],
    ):
        self.email = email
        self.slack = slack
        # self.whatsapp = whatsapp

    async def send(
        self,
        notification: Notification,
        channels: Sequence[Channel],
    ) -> None:
        tasks = []

        for channel in channels:
            match channel:
                case Channel.EMAIL:
                    tasks.append(
                        self.email.send(
                            notification.to_email()
                        )
                    )

                case Channel.SLACK:
                    tasks.append(
                        self.slack.send(
                            notification.to_slack()
                        )
                    )

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
            return

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