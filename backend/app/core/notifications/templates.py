from typing import Any
from app.core.utils import generate_abandoned_cart_email


class TemplateEngine:
    """
    Minimal template engine. 
    Swap this out for Jinja2 if your templates grow complex.
    """

    def render(self, channel: str, event_name: str, context: dict[str, Any]) -> Any:
        method = f"_{event_name}"
        if not hasattr(self, method):
            raise NotImplementedError(
                f"No template defined for channel='{channel}' event='{event_name}'"
            )
        return getattr(self, method)(context)

    # ------------------------------------------------------------------ #
    # Email templates
    # ------------------------------------------------------------------ #

    def _email_order_confirmed(self, ctx: dict) -> str:
        name = ctx.get("user_name") or "there"
        order_id = ctx.get("order_id")
        total = ctx.get("order_total")
        total_line = f"<p><strong>Order total:</strong> ${total:.2f}</p>" if total else ""
        return f"""
        <h2>Hey {name}, your order is confirmed! 🎉</h2>
        <p>Order <strong>#{order_id}</strong> has been received and is being processed.</p>
        {total_line}
        <p>We'll notify you once it ships.</p>
        """

    def _email_order_shipped(self, ctx: dict) -> str:
        order_id = ctx.get("order_id")
        tracking = ctx.get("tracking_number")
        tracking_line = f"<p><strong>Tracking number:</strong> {tracking}</p>" if tracking else ""
        return f"""
        <h2>Your order is on its way! 🚚</h2>
        <p>Order <strong>#{order_id}</strong> has been shipped.</p>
        {tracking_line}
        """

    def _send_abandoned_cart(self, ctx: dict) -> tuple[str, dict]:
        email_data = generate_abandoned_cart_email(
            cart_data=ctx.cart,
            user_email=ctx.email or ctx.user.email,
            user_name=ctx.user.first_name or ctx.user.username
        )
        dict_data = {
            "subject": email_data.subject,
            "recipient": ctx.email or ctx.user.email,
            "subscriptions": ctx.subscriptions,
            "notification": {"title": "Your cart is waiting 🛒", "body": "Complete checkout before your items sell out."},
            "slack_message": {
                "text": f"✅ *Abandoned cart reminder sent to {ctx.user_email}*\nCart: {ctx.cart.cart_number}",
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": f"✅ *Abandoned cart reminder sent to {ctx.user_email}*\nCart: {ctx.cart.cart_number}"
                        }
                    }
                ]
            }
        }
        return email_data.html_content, dict_data

    def _send_push_notification(self, ctx: dict) -> tuple[str, dict]:
        print("ctx.......", ctx)
        dict_data = {
            "subject": "",
            "recipient": "",
            "subscriptions": ctx.subscriptions,
            "notification": ctx.notification,
        }
        return "", dict_data

    # ------------------------------------------------------------------ #
    # WhatsApp templates (plain text only)
    # ------------------------------------------------------------------ #

    def _whatsapp_order_confirmed(self, ctx: dict) -> str:
        name = ctx.get("user_name") or "there"
        order_id = ctx.get("order_id")
        return f"Hey {name}! Your order #{order_id} is confirmed ✅. We'll update you when it ships."

    def _whatsapp_order_shipped(self, ctx: dict) -> str:
        order_id = ctx.get("order_id")
        tracking = ctx.get("tracking_number", "N/A")
        return f"Great news! Order #{order_id} is on its way 🚚. Tracking: {tracking}"

    # ------------------------------------------------------------------ #
    # Slack templates (block kit dicts)
    # ------------------------------------------------------------------ #

    def _slack_order_confirmed(self, ctx: dict) -> dict:
        return {
            "text": f"New order confirmed: #{ctx.get('order_id')}",
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"✅ *Order #{ctx.get('order_id')} confirmed*\nCustomer: {ctx.get('user_email')}",
                    },
                }
            ],
        }
