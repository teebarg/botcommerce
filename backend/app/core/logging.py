import logging
import requests
from app.core.config import settings
import logging.config


SUCCESS_LEVEL_NUM = 25
logging.addLevelName(SUCCESS_LEVEL_NUM, "SUCCESS")

def success(self, message, *args, **kwargs):
    if self.isEnabledFor(SUCCESS_LEVEL_NUM):
        self._log(SUCCESS_LEVEL_NUM, message, args, **kwargs)

logging.Logger.publish = success

class SlackLogHandler(logging.Handler):
    def __init__(self, channel="alerts"):
        super().__init__(SUCCESS_LEVEL_NUM)
        self.channel = channel

    def emit(self, record):
        try:
            if record.levelno < SUCCESS_LEVEL_NUM:
                return
            msg = self.format(record)
            channel = getattr(record, "channel", self.channel)
            level = record.levelname.lower()
            send_slack_message(msg, level=level, channel=channel)
        except Exception as e:
            logging.getLogger(__name__).error(f"SlackLogHandler error: {e}")

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
            "class": SlackLogHandler,
            "formatter": "standard",
            "channel": "alerts",
        },
    },
    "loggers": {
        "": {  # root logger
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

# Slack utility for sending messages
def send_slack_message(text, level="info", channel: str = "alerts", webhook_url: str = None):
    channel_map = {
        "alerts": settings.SLACK_ALERTS,
        "orders": settings.SLACK_ORDERS,
    }
    title_map = {
        "info": "INFO",
        "warning": "WARNING",
        "error": "ERROR",
        "critical": "CRITICAL",
        "debug": "DEBUG",
        "success": "SUCCESS",
    }
    CATEGORY_EMOJIS = {
        "info": "ℹ️",
        "warning": "⚠️",
        "error": "⚠️",
        "critical": "🚨",
        "success": "✅",
        "debug": "🐛",
    }
    color_map = {
        "info": "#36a64f",
        "warning": "#FFC107",
        "error": "#FF0000",
        "critical": "#FF0000",
        "debug": "#000000",
        "success": "#2ECC71",
    }
    url = webhook_url or channel_map.get(channel)
    if not url:
        logging.error(f"No Slack webhook configured for channel '{channel}'")
        return

    formatted_title = f"{CATEGORY_EMOJIS.get(level, 'ℹ️')} {title_map.get(level, 'Notification Error')}"
    payload = {
        "attachments": [
            {
                "fallback": text,
                "color": color_map.get(level, "#FF0000"),
                "title": formatted_title,
                "text": text,
            }
        ]
    }
    try:
        requests.post(url, json=payload, timeout=5)
    except Exception as e:
        logging.error(f"Failed to send Slack message: {e}")

logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger(__name__)

def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
