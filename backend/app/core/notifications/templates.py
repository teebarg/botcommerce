from typing import Any
from app.core.utils import generate_abandoned_cart_email, generate_invoice_email, generate_payment_receipt


class TemplateEngine:
    async def render(self, channel: str, event_name: str, context: dict[str, Any]) -> Any:
        method = f"_{event_name}"
        if not hasattr(self, method):
            raise NotImplementedError(
                f"No template defined for channel='{channel}' event='{event_name}'"
            )
        return await getattr(self, method)(context)

    async def _order_confirmed(self, ctx: dict) -> tuple[str, dict]:
        order = ctx.get("order")
        user = ctx.get("user")
        email = user.email
        email_data = await generate_invoice_email(order=order, user=user)

        # Format items overview so it looks clean inside a block code box or layout
        items_raw = ctx.get('items_overview', 'No items specified')
        
        # Map a hex color or border look based on payment status
        is_paid = getattr(order, "payment_status", "").lower() == "paid"
        status_color = "#2eb886" if is_paid else "#ecefc6" 
        status_emoji = "✅ Paid" if is_paid else f"⏳ {order.payment_status}"

        dict_data = {
            "subject": email_data.subject,
            "recipient": email,
            "cc_list": ctx.get("cc_list"),
            "slack_message": {
                # Fallback text required by Slack notifications/popups
                "text": f"🛍️ New Order {order.order_number} confirmed!",
                "attachments": [
                    {
                        "color": status_color,
                        "blocks": [
                            {
                                "type": "header",
                                "text": {
                                    "type": "plain_text",
                                    "text": "🛍️ New Order Confirmed",
                                    "emoji": True
                                }
                            },
                            {
                                "type": "section",
                                "fields": [
                                    {"type": "mrkdwn", "text": f"*Order Link:*\n<{ctx.get('order_link')}|#{order.order_number}>"},
                                    {"type": "mrkdwn", "text": f"*Total Amount:*\n*₦{order.total}*"}
                                ]
                            },
                            {
                                "type": "section",
                                "fields": [
                                    {"type": "mrkdwn", "text": f"*Customer:*\n{user.first_name} {user.last_name}"},
                                    {"type": "mrkdwn", "text": f"*Payment Status:*\n{status_emoji}"}
                                ]
                            },
                            {
                                "type": "section",
                                "fields": [
                                    {"type": "mrkdwn", "text": f"*Email:*\n{email}"}
                                ]
                            },
                            {"type": "divider"},
                            {
                                "type": "section",
                                "text": {
                                    "type": "mrkdwn",
                                    "text": f"*Items Purchased:*\n```{items_raw}```"
                                }
                            }
                        ]
                    }
                ]
            }
        }
        return email_data.html_content, dict_data

    async def _send_abandoned_cart(self, ctx: dict) -> tuple[str, dict]:
        cart = ctx.get("cart", {})
        email: str = ctx.get("user_email", "")
        email_data = await generate_abandoned_cart_email(
            cart_data=cart,
            user_email=email,
            user_name=ctx.get("user_name")
        )
        dict_data = {
            "subject": email_data.subject,
            "recipient": email,
            "subscriptions": ctx.get("subscriptions"),
            "notification": {"title": "Your cart is waiting 🛒", "body": "Complete checkout before your items sell out."},
            "slack_message": {
                "text": f"✅ *Abandoned cart reminder sent to {email}*\nCart: {cart.get('cart_number')}",
                "blocks": [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": f"✅ *Abandoned cart reminder sent to {email}*\nCart: {cart.get('cart_number')}"
                        }
                    }
                ]
            }
        }
        return email_data.html_content, dict_data

    async def _send_invoice(self, ctx: dict) -> tuple[str, dict]:
        order = ctx.get("order")
        email_data = await generate_payment_receipt(order=order, user=order.user)
        dict_data = {
            "subject": email_data.subject,
            "recipient": order.user.email if order.user else "",
            "cc_list": ctx.get("cc_list")
        }
        return email_data.html_content, dict_data

    async def _send_push_notification(self, ctx: dict) -> tuple[str, dict]:
        dict_data = {
            "subject": "",
            "recipient": "",
            "subscriptions": ctx.get("subscriptions"),
            "notification": ctx.get("notification"),
        }
        return "", dict_data
