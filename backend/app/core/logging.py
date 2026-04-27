import logging
import logging.config
import httpx
from app.core.config import settings

SUCCESS_LEVEL_NUM = 25
logging.addLevelName(SUCCESS_LEVEL_NUM, "SUCCESS")

def success(self, message, *args, **kwargs):
    if self.isEnabledFor(SUCCESS_LEVEL_NUM):
        self._log(SUCCESS_LEVEL_NUM, message, args, **kwargs)

logging.Logger.success = success


async def send_slack_message(text, level="info", channel: str = "alerts", webhook_url: str = None):
    channel_map = {"alerts": settings.SLACK_ALERTS, "orders": settings.SLACK_ORDERS}
    title_map = {"info": "INFO", "warning": "WARNING", "error": "ERROR",
                 "critical": "CRITICAL", "debug": "DEBUG", "success": "SUCCESS"}
    emoji_map = {"info": "ℹ️", "warning": "⚠️", "error": "⚠️",
                 "critical": "🚨", "success": "✅", "debug": "🐛"}
    color_map = {"info": "#36a64f", "warning": "#FFC107", "error": "#FF0000",
                 "critical": "#FF0000", "debug": "#000000", "success": "#2ECC71"}

    url = webhook_url or channel_map.get(channel)
    if not url:
        logging.error(f"No Slack webhook configured for channel '{channel}'")
        return

    payload = {
        "attachments": [{
            "fallback": text,
            "color": color_map.get(level, "#FF0000"),
            "title": f"{emoji_map.get(level, 'ℹ️')} {title_map.get(level, 'Notification')}",
            "text": text,
        }]
    }
    try:
         async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=5)
            return response.status_code == 200
    except Exception as e:
        logging.error(f"Failed to send Slack message: {e}")
        return False


class SlackLogHandler(logging.Handler):
    def __init__(self, channel="alerts"):
        super().__init__()
        self.channel = channel

    def emit(self, record):
        try:
            if record.levelno < SUCCESS_LEVEL_NUM:
                return
            msg = self.format(record)
            channel = getattr(record, "channel", self.channel)
            send_slack_message(msg, level=record.levelname.lower(), channel=channel)
        except Exception:
            self.handleError(record)

# Dictionary to configure logging
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(funcName)s():\n%(message)s"
        },
    },
    "handlers": {
        "console": {
            "level": "DEBUG",
            "formatter": "standard",
            "class": "logging.StreamHandler",
        },
        "slack_alerts": {
            "level": SUCCESS_LEVEL_NUM,
            "()": SlackLogHandler,
            "formatter": "standard",
            "channel": "alerts",
        },
    },
    "loggers": {
        "": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": False,
        },
        "app": {
            "handlers": ["console", "slack_alerts"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}

logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger(__name__)

def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)