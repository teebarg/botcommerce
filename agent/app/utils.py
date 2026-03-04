import logging
from datetime import datetime, timezone
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

async def _notify_slack_escalation(
    session_id: str | None,
    customer_id: str | None,
    reason: str,
) -> None:
    """
    Post an escalation alert to Slack via incoming webhook.
    Fails silently — a notification failure should never break the agent response.
    """
    webhook_url: str | None = settings.SLACK_WEBHOOK_URL
    if not webhook_url:
        logger.warning("[Escalation] SLACK_WEBHOOK_URL not set — skipping Slack notification")
        return

    # Strip internal prefixes from the reason string
    reason_clean = reason.replace("ESCALATED_TO_HUMAN: ", "").replace("ESCALATED: ", "").strip()
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    payload = {
        "blocks": [
            {
                "type": "header",
                "text": {"type": "plain_text", "text": "🚨 Escalation: Customer Needs Human Support"},
            },
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": "*Session ID:*\n`" + (session_id or "unknown") + "`"},
                    {"type": "mrkdwn", "text": "*Customer ID:*\n`" + (customer_id or "guest") + "`"},
                    {"type": "mrkdwn", "text": "*Time:*\n" + timestamp},
                    {"type": "mrkdwn", "text": "*Reason:*\n" + reason_clean},
                ],
            },
            {"type": "divider"},
            {
                "type": "context",
                "elements": [
                    {"type": "mrkdwn", "text": "Reply to this thread once the customer has been contacted."}
                ],
            },
        ]
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(webhook_url, json=payload)
            if resp.status_code == 200:
                logger.info(f"[Escalation] Slack notified for session {session_id}")
            else:
                logger.warning(f"[Escalation] Slack returned {resp.status_code}: {resp.text}")
    except Exception as exc:
        logger.error(f"[Escalation] Slack notification failed: {exc}")
