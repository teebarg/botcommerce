import logging
import asyncio
import traceback
import httpx
from app.config import settings

class AsyncSlackHandler(logging.Handler):
    """
    Custom asynchronous non-blocking logging handler for Slack.
    """
    def __init__(self, webhook_url: str):
        super().__init__()
        self.webhook_url = webhook_url
        self.client = httpx.AsyncClient(timeout=5.0)

    def emit(self, record: logging.LogRecord):
        # Prevent logging loops if Slack requests fail
        if record.name == "httpx" or "slack" in record.getMessage().lower():
            return
            
        try:
            asyncio.create_task(self._send_to_slack(record))
        except Exception:
            # Fallback if the asyncio loop hasn't started yet
            pass

    async def _send_to_slack(self, record: logging.LogRecord):
        if not self.webhook_url:
            return

        log_message = self.format(record)
        
        if record.levelno >= logging.CRITICAL:
            color = "#ff0000"  # Dark Red
            emoji = "🚨 *CRITICAL EXCEPTION*"
        elif record.levelno >= logging.ERROR:
            color = "#e01e5a"  # Red-Pink
            emoji = "❌ *JOB ERROR*"
        elif record.levelno >= logging.WARNING:
            color = "#ecb22e"  # Yellow
            emoji = "⚠️ *WORKER WARNING*"
        else:
            color = "#2eb67d"  # Slack Green
            emoji = "ℹ️ *WORKER INFO*"

        # Handle system errors and backtrace snippets dynamically
        extra_details = ""
        if record.exc_info:
            exc_type, exc_value, exc_tb = record.exc_info
            trace_str = "".join(traceback.format_exception(exc_type, exc_value, exc_tb))
            # Wrap within code formatting blocks inside Slack markdown layout
            extra_details = f"\n*Traceback:*\n```\n{trace_str[-1000:]}\n```"

        payload = {
            "attachments": [
                {
                    "color": color,
                    "title": f"{emoji} | Module: {record.module}",
                    "text": f"{log_message}{extra_details}",
                    "footer": f"File: {record.filename} | Line: {record.lineno}",
                    "ts": record.created
                }
            ]
        }

        try:
            await self.client.post(self.webhook_url, json=payload)
        except Exception:
            pass

def setup_worker_logging():
    """Initializes unified project streams"""
    logger = logging.getLogger("worker_logger")
    logger.setLevel(logging.INFO)
    logger.propagate = False

    # Prevent duplicating handlers when watchfiles reloads code blocks
    if not logger.handlers:
        stream_formatter = logging.Formatter("[%(levelname)s] %(asctime)s - %(message)s")
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(stream_formatter)
        logger.addHandler(console_handler)

        if settings.SLACK_WEBHOOK_URL:
            slack_formatter = logging.Formatter("%(message)s")
            slack_handler = AsyncSlackHandler(settings.SLACK_WEBHOOK_URL)
            slack_handler.setLevel(logging.WARNING)  # Send only warnings/errors live
            slack_handler.setFormatter(slack_formatter)
            logger.addHandler(slack_handler)

    return logger

logger = setup_worker_logging()
