import httpx
import random
import string
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

import emails  # type: ignore
from fastapi import Request
from jinja2 import Environment, FileSystemLoader
from app.core.config import settings
from app.core.logging import logger
from app.models.coupon import Coupon


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

def normalize_image(image: str):
    return image.replace("mp4", "webp")


def format_image(image: str):
    return image

def url_to_list(url: str) -> list[str]:
    return [f'{item}' for item in url.split(",")]

def format_date(date: datetime) -> str:
    return date.strftime("%B %d, %Y")

def format_discount(coupon: Coupon) -> str:
    if coupon.discount_type == "PERCENTAGE":
        return f"{int(coupon.discount_value) if coupon.discount_value.is_integer() else coupon.discount_value}%"
    return f"₦{coupon.discount_value:,.2f}"


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
    slug: str = ''.join(char for char in text if char.isalnum() or char == '-')
    while '--' in slug:
        slug = slug.replace('--', '-')
    slug: str = slug.strip('-')

    return slug


def render_email_template(*, template_name: str, context: dict[str, Any]) -> str:
    template_path = Path(__file__).parent.parent / "email-templates" / "build"
    env = Environment(loader=FileSystemLoader(template_path))
    env.filters["naira"] = format_naira
    env.filters["image"] = format_image
    env.filters["date"] = format_date
    env.filters["normalize_image"] = normalize_image
    env.filters["discount"] = format_discount
    # Load and render the template
    template = env.get_template(template_name)
    return template.render(context)


async def send_email_smtp(
    *,
    email_to: str,
    subject: str = "",
    html_content: str = "",
    cc_list: list[str] = [],
) -> None:
    if not settings.EMAILS_ENABLED:
        return
    if email_to.lower().endswith("@guest.com"):
        logger.debug("Skipping email send to guest.com address: %s", email_to)
        return

    try:
        headers = {
            "X-Priority": "1",               # High priority
            "X-MSMail-Priority": "High",     # Outlook/Exchange
            "Importance": "High",            # Gmail/others
            "Disposition-Notification-To": settings.EMAILS_FROM_EMAIL,  # Read receipt
            "Return-Receipt-To": settings.EMAILS_FROM_EMAIL,            # Delivery receipt
        }
        message = emails.Message(
            subject=subject,
            cc=cc_list,
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
        logger.debug(f"send email result: {response}")
        if not response.status_code or response.status_code != 250:
            raise Exception("Email sending failed")
    except Exception as e:
        logger.error(f"Email sending failed: {str(e)}")
        raise Exception(f"Email sending failed: {str(e)}")


async def send_email_brevo(
    *,
    email_to: str,
    subject: str = "",
    html_content: str = "",
    cc_list: list[str] = [],
) -> None:
    """
    Send email via Brevo (formerly Sendinblue) API

    Required environment variables:
    - BREVO_API_KEY: Your Brevo API key
    - EMAILS_FROM_EMAIL: Sender email
    - EMAILS_FROM_NAME: Sender name
    """

    if not settings.EMAILS_ENABLED:
        logger.warning("Emails disabled via EMAILS_ENABLED setting")
        return

    if email_to.lower().endswith("@guest.com"):
        logger.debug("Skipping email send to guest.com address: %s", email_to)
        return

    if not hasattr(settings, 'BREVO_API_KEY') or not settings.BREVO_API_KEY:
        logger.error("BREVO_API_KEY not configured")
        raise Exception("BREVO_API_KEY not configured")

    payload = {
        "sender": {
            "name": settings.EMAILS_FROM_NAME,
            "email": settings.EMAILS_FROM_EMAIL
        },
        "to": [{"email": email_to}],
        "subject": subject,
        "htmlContent": html_content,
        "headers": {
            "X-Priority": "1",
            "X-MSMail-Priority": "High",
            "Importance": "High"
        }
    }

    if cc_list:
        payload["cc"] = [{"email": email} for email in cc_list]

    if not html_content:
        payload["textContent"] = subject

    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": settings.BREVO_API_KEY
    }

    logger.debug(f"Sending email via Brevo to: {email_to}")

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.brevo.com/v3/smtp/email",
                json=payload,
                headers=headers,
                timeout=30
            )

        if response.status_code == 201:
            response_data = response.json()
            message_id = response_data.get("messageId", "unknown")
            logger.debug(f"Email sent successfully via Brevo. Message ID: {message_id}")
        else:
            error_text = response.text
            logger.critical(f"Brevo API error: {response.status_code} - {error_text}")

            raise Exception(f"Brevo API error: {response.status_code} - {error_text}")

    except httpx.TimeoutException:
        logger.error("Brevo API request timed out")
        raise Exception("Brevo API request timed out")
    except httpx.RequestError as e:
        logger.error(f"Brevo API request failed: {str(e)}")
        raise Exception(f"Brevo API request failed: {str(e)}")
    except Exception as e:
        logger.error(f"Brevo email sending failed: {str(e)}")
        raise Exception(f"Brevo email sending failed: {str(e)}")


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
    """
    Generate a unique ID.
    Format: {prefix}-{RANDOM}
    Example: cart_7G9X2
    """
    chars = string.ascii_uppercase + string.digits
    unique_part = "".join(random.choice(chars) for _ in range(length))
    return prefix + unique_part

def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host
