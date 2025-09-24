import random
import string
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

import emails  # type: ignore
from app.core.config import settings
from app.core.logging import logger
from app.models.order import OrderResponse
from app.models.user import User
from jinja2 import Environment, FileSystemLoader, Template
from app.services.shop_settings import ShopSettingsService


@dataclass
class EmailData:
    html_content: str
    subject: str


# Custom JSON encoder for datetime
def custom_serializer(obj: Any) -> str:
    if isinstance(obj, datetime):
        return obj.isoformat()  # Serialize datetime as ISO 8601 string
    raise TypeError("Type not serializable")

# Custom JSON decoder for datetime
def custom_deserializer(obj: dict) -> dict:
    for key, value in obj.items():
        if isinstance(value, str) and "T" in value:  # ISO 8601 detection
            try:
                obj[key] = datetime.fromisoformat(value)
            except ValueError:
                pass
    return obj


def format_naira(value: int):
    return f"₦{value:,.2f}" if value else "₦0.00"


def format_image(image: str):
    return image

def url_to_list(url: str) -> list[str]:
    return [f'{item}' for item in url.split(",")]

def format_date(date: datetime) -> str:
    return date.strftime("%B %d, %Y")


def slugify(text) -> str:
    """
    Convert a string into a URL-friendly slug.

    Args:
        text (str): The input string to convert

    Returns:
        str: The slugified string
    """
    if not text:
        return ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    text = text.lower().replace(' ', '-')
    slug = ''.join(char for char in text if char.isalnum() or char == '-')
    while '--' in slug:
        slug = slug.replace('--', '-')
    slug = slug.strip('-')

    return slug

async def merge_metadata(metadata: Optional[dict[str, Any]] = {}) -> dict[str, Any]:
    service = ShopSettingsService()
    shop_name = await service.get("shop_name")
    shop_address = await service.get("address")

    return {
        "project_name": shop_name,
        "address": shop_address,
        "description": "Exclusive offers just for you",
        "frontend_host": settings.FRONTEND_HOST,
        "facebook": await service.get("facebook"),
        "instagram": await service.get("instagram"),
        "tiktok": await service.get("tiktok"),
        "support_email": await service.get("shop_email"),
        **metadata
    }


def render_email_template(*, template_name: str, context: dict[str, Any]) -> str:
    # Set up Jinja2 environment and add the custom filter
    template_path = Path(__file__).parent.parent / "email-templates" / "build"
    env = Environment(loader=FileSystemLoader(template_path))
    env.filters["naira"] = format_naira
    env.filters["image"] = format_image
    env.filters["date"] = format_date

    # Load and render the template
    template = env.get_template(template_name)
    return template.render(context)


def render_email_template2(*, template_name: str, context: dict[str, Any]) -> str:
    template_str = (
        Path(__file__).parent.parent / "email-templates" / "build" / template_name
    ).read_text()
    html_content = Template(template_str).render(context)
    return html_content


async def send_email(
    *,
    email_to: str,
    subject: str = "",
    html_content: str = "",
    cc_list: list[str] = [],
) -> None:
    if not settings.EMAILS_ENABLED:
        return
    if email_to.lower().endswith("@guest.com"):
        logger.info("Skipping email send to guest.com address: %s", email_to)
        return
    service = ShopSettingsService()
    shop_email = await service.get("shop_email")
    cc_list.append(shop_email)
    try:
        headers = {
            "Cc": ", ".join(cc_list) if cc_list else "",
            "X-Priority": "1",               # High priority
            "X-MSMail-Priority": "High",     # Outlook/Exchange
            "Importance": "High",            # Gmail/others
            "Disposition-Notification-To": settings.EMAILS_FROM_EMAIL,  # Read receipt
            "Return-Receipt-To": settings.EMAILS_FROM_EMAIL,            # Delivery receipt
        }
        message = emails.Message(
            subject=subject,
            html=html_content,
            mail_from=(settings.EMAILS_FROM_NAME, settings.EMAILS_FROM_EMAIL),
            headers={k: v for k, v in headers.items() if v},
        )
        smtp_options = {"host": settings.SMTP_HOST, "port": settings.SMTP_PORT}
        if settings.SMTP_TLS:
            smtp_options["tls"] = True
        elif settings.SMTP_SSL:
            smtp_options["ssl"] = True
        if settings.SMTP_USER:
            smtp_options["user"] = settings.SMTP_USER
        if settings.SMTP_PASSWORD:
            smtp_options["password"] = settings.SMTP_PASSWORD
        response = message.send(to=email_to, smtp=smtp_options)
        logger.info(f"send email result: {response}")  
    except Exception as e:
        logger.error(f"Email sending failed: {str(e)}")


def generate_test_email(email_to: str) -> EmailData:
    html_content = render_email_template(
        template_name="test.html",
        context={"email": email_to, **merge_metadata({})},
    )
    return EmailData(html_content=html_content, subject="Test email")


async def generate_invoice_email(order: OrderResponse, user: User) -> EmailData:
    template_name = "paid_invoice.html"
    description = "Your order has been processed"
    if order.payment_method == "CASH_ON_DELIVERY":
        template_name = "pickup_invoice.html"
        description = "Your order has been processed"
    elif order.payment_status == "PENDING":
        template_name = "pending_invoice.html"
        description = "Your order is pending payment"
    elif order.payment_status == "FAILED":
        template_name = "failed_invoice.html"
        description = "Your order payment failed"

    html_content = render_email_template(
        template_name=template_name,
        context={
            "order": order,
            "user": user,
            "current_year": datetime.now().year,
            **(await merge_metadata({"description": description}))
        },
    )
    return EmailData(html_content=html_content, subject="Order Confirmation")


async def generate_payment_receipt(order: OrderResponse, user: User) -> EmailData:
    html_content = render_email_template(
        template_name="payment_receipt.html",
        context={
            "order": order,
            "user": user,
            "current_year": datetime.now().year,
            **(await merge_metadata({"description": ""}))
        },
    )
    return EmailData(html_content=html_content, subject="Payment Receipt")


async def generate_new_account_email(
    email_to: str, username: str, password: str
) -> EmailData:
    html_content = render_email_template(
        template_name="new_account.html",
        context={
            "username": username,
            "password": password,
            "email": email_to,
            "link": settings.server_host,
            **(await merge_metadata({"description": ""}))
        },
    )
    return EmailData(html_content=html_content, subject=f"New account for user {username}")


async def generate_data_export_email(download_link: str) -> EmailData:
    html_content = render_email_template(
        template_name="data_export.html",
        context={
            "download_link": download_link,
            **(await merge_metadata({"description": ""}))
        },
    )
    return EmailData(html_content=html_content, subject="Your Data Export is Ready")


async def generate_contact_form_email(
    name: str, email: str, phone: str, message: str
) -> EmailData:
    html_content = render_email_template(
        template_name="contact_form.html",
        context={
            "name": name,
            "email": email,
            "phone": phone,
            "message": message,
            "current_year": datetime.now().year,
            **(await merge_metadata({"description": "New Contact Email"}))
        },
    )
    return EmailData(html_content=html_content, subject="New Contact Email")


async def generate_bulk_purchase_email(name: str, email: str, phone: str, bulkType: str, quantity: str | None = None, message: str | None = None) -> EmailData:
    html_content = render_email_template(
        template_name="bulk_purchase.html",
        context={
            "name": name,
            "email": email,
            "phone": phone,
            "bulkType": bulkType,
            "quantity": quantity or "Not specified",
            "message": message or "No additional details provided",
            "current_year": datetime.now().year,
            **(await merge_metadata({"description": "New Bulk Purchase Inquiry"}))
        },
    )
    return EmailData(html_content=html_content, subject="New Bulk Purchase Inquiry")


async def generate_newsletter_email(email: str) -> EmailData:
    html_content = render_email_template(
        template_name="newsletter.html",
        context={
            "email": email,
            "unsubscribe_link": "",
            "current_year": datetime.now().year,
            **(await merge_metadata({"description": "Welcome to our newsletter"}))
        },
    )
    return EmailData(html_content=html_content, subject="Welcome to our newsletter")


def generate_sku(prefix: str = "PRD") -> str:
    """
    Generate a unique product SKU.
    Format: {prefix}-{YYYYMMDD}-{RANDOM}
    Example: PRD-20250825-7G9X2
    """
    date_part = datetime.now().strftime("%Y%m%d")
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"{prefix}-{date_part}-{random_part}"



def generate_id(prefix="cart_", length=25):
    chars = string.ascii_uppercase + string.digits
    unique_part = "".join(random.choice(chars) for _ in range(length))
    return prefix + unique_part


async def generate_magic_link_email(email_to: str, magic_link: str, first_name: str) -> EmailData:
    html_content = render_email_template(
        template_name="magic_link.html",
        context={
            "email": email_to,
            "magic_link": magic_link,
            "first_name": first_name,
            **(await merge_metadata({"description": "Magic Link to sign in to your account"}))
        },
    )
    return EmailData(html_content=html_content, subject="Sign in to your account")


async def generate_welcome_email(email_to: str, first_name: str) -> EmailData:
    service = ShopSettingsService()
    shop_name = await service.get("shop_name")

    html_content = render_email_template(
        template_name="welcome.html",
        context={
            "first_name": first_name,
            "email": email_to,
            "current_year": datetime.now().year,
            **(await merge_metadata({"description": ""}))
        },
    )
    return EmailData(html_content=html_content, subject="Welcome to " + shop_name)


async def generate_verification_email(email_to: str, first_name: str, verification_link: str) -> EmailData:
    html_content = render_email_template(
        template_name="verify_email.html",
        context={
            "first_name": first_name,
            "email": email_to,
            "verification_link": verification_link,
            "current_year": datetime.now().year,
            **(await merge_metadata({}))
        },
    )
    return EmailData(html_content=html_content, subject="Verify Your Email")
