from typing import Any

from redis.asyncio import Redis

from prisma import Prisma


class TemplateEngine:
    def __init__(self, db: Prisma, redis: Redis):
        self.db = db
        self.redis = redis
        self.settings_srv = None

    async def render(self, channel: str, event_name: str, context: dict[str, Any]) -> Any:
        method = f"_{event_name}"
        if not hasattr(self, method):
            raise NotImplementedError(
                f"No template defined for channel='{channel}' event='{event_name}'"
            )
        return await getattr(self, method)(context)

    async def _send_push_notification(self, ctx: dict) -> tuple[str, dict]:
        dict_data = {
            "subject": "",
            "recipient": "",
            "subscriptions": ctx.get("subscriptions"),
            "notification": ctx.get("notification"),
        }
        return "", dict_data
