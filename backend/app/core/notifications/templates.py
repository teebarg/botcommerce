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
        dict_data = {
            "subject": email_data.subject,
            "recipient": email,
            "cc_list": ctx.get("cc_list"),
            "slack_message": {
                "text": (
                    f"🛍️ *New Order Created* 🛍️\n"
                    f"*Order:* <{ctx.get('order_link')}|{order.order_number}>\n"
                    f"*Customer:* {user.first_name} {user.last_name}\n"
                    f"*Email:* {email}\n"
                    f"*Amount:* {order.total}\n"
                    f"*Payment Status:* {order.payment_status}\n"
                    f"*Items:*\n{ctx.get('items_overview')}\n"
                ),
            }
        }
        return email_data.html_content, dict_data

    async def _send_abandoned_cart(self, ctx: dict) -> tuple[str, dict]:
        cart = ctx.get("cart", {})
        email = ctx.get("user_email")
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
        email_data = generate_payment_receipt(order=order, user=order.get("user"))
        dict_data = {
            "subject": email_data.subject,
            "recipient": order.get("user", {}).get("email"),
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
