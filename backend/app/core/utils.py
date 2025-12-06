import httpx
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
from app.models.coupon import CouponResponse


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

def format_discount(coupon: CouponResponse) -> str:
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
    slug = ''.join(char for char in text if char.isalnum() or char == '-')
    while '--' in slug:
        slug = slug.replace('--', '-')
    slug = slug.strip('-')

    return slug

async def merge_metadata(metadata: Optional[dict[str, Any]] = {}) -> dict[str, Any]:
    service = ShopSettingsService()
    shop_name = await service.get("shop_name")
    shop_address = await service.get("address")
    shop_phone = await service.get("contact_phone")  

    return {
        "project_name": shop_name,
        "address": shop_address,
        "phone": shop_phone,
        "description": "Exclusive offers just for you",
        "frontend_host": settings.FRONTEND_HOST,
        "facebook": await service.get("facebook"),
        "instagram": await service.get("instagram"),
        "tiktok": await service.get("tiktok"),
        "support_email": await service.get("shop_email"),
        "current_year": datetime.now().year,
        **metadata
    }


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


def render_email_template2(*, template_name: str, context: dict[str, Any]) -> str:
    template_str = (
        Path(__file__).parent.parent / "email-templates" / "build" / template_name
    ).read_text()
    html_content = Template(template_str).render(context)
    return html_content


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
        logger.info("Skipping email send to guest.com address: %s", email_to)
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
        logger.info(f"send email result: {response}")
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
        logger.info("Emails disabled via EMAILS_ENABLED setting")
        return

    if email_to.lower().endswith("@guest.com"):
        logger.info("Skipping email send to guest.com address: %s", email_to)
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

    logger.info(f"Sending email via Brevo to: {email_to}")

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
            logger.info(f"Email sent successfully via Brevo. Message ID: {message_id}")
        else:
            error_text = response.text
            logger.error(f"Brevo API error: {response.status_code} - {error_text}")

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


async def send_email(
    *,
    email_to: str,
    subject: str = "",
    html_content: str = "",
    cc_list: list[str] = [],
) -> None:
    try:
        if settings.ENVIRONMENT == "local2":
            await send_email_smtp(
                email_to=email_to,
                subject=subject,
                html_content=html_content,
                cc_list=cc_list
            )
        else:
            await send_email_brevo(
                email_to=email_to,
                subject=subject,
                html_content=html_content,
                cc_list=cc_list
        )
    except Exception as e:
        logger.error(f"Email sending failed: {str(e)}")
        raise


def generate_test_email(email_to: str) -> EmailData:
    html_content = render_email_template(
        template_name="test.html",
        context={"email": email_to, **merge_metadata({})},
    )
    return EmailData(html_content=html_content, subject="Test email")


async def generate_invoice_email(order: OrderResponse, user: User) -> EmailData:
    service = ShopSettingsService()
    header_title = "Your order has been processed successfully"
    template_name = "paid_invoice.html"
    description = "Your order has been processed"
    bank_details = None
    if order.payment_method == "CASH_ON_DELIVERY":
        template_name = "pickup_invoice.html"
        header_title = "Your order has been processed"
        description = "Your order has been processed"
        bank_details = await service.get_bank_details()
    elif order.payment_status == "PENDING":
        header_title = "Your order is pending payment"
        template_name = "pending_invoice.html"
        description = "Your order is pending payment"
        bank_details = await service.get_bank_details()
    elif order.payment_status == "FAILED":
        header_title = "Your order payment failed"
        template_name = "failed_invoice.html"
        description = "Your order payment failed"

    html_content = render_email_template(
        template_name=template_name,
        context={
            "order": order,
            "user": user,
            "current_year": datetime.now().year,
            "header_title": header_title,
            "cta_url": f"order/confirmed/{order.order_number}",
            "cta_text": "View Order",
            "bank_details": bank_details,
            **(await merge_metadata({"description": description}))
        },
    )
    return EmailData(html_content=html_content, subject=f"Order Confirmation for {order.order_number}")


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


async def generate_welcome_email(email_to: str, first_name: str, coupon: CouponResponse) -> EmailData:
    service = ShopSettingsService()
    shop_name = await service.get("shop_name")

    html_content = render_email_template(
        template_name="welcome.html",
        context={
            "first_name": first_name,
            "email": email_to,
            "current_year": datetime.now().year,
            "coupon": coupon,
            "header_title": "Welcome Gift Inside! 🎁",
            "header_subtitle": f"We're excited to have you here, {first_name}!!",
            "cta_url": "collections",
            "cta_text": "Start Shopping",
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


async def generate_abandoned_cart_email(cart_data: dict, user_email: str, user_name: str = None) -> EmailData:
    """Generate abandoned cart reminder email"""
    html_content = render_email_template(
        template_name="abandoned_cart.html",
        context={
            "user_name": user_name or "Customer",
            "user_email": user_email,
            "cart": cart_data,
            "cart_link": f"{settings.FRONTEND_HOST}/cart",
            "current_year": datetime.now().year,
            **(await merge_metadata({"description": "Complete your purchase"}))
        },
    )
    return EmailData(html_content=html_content, subject="Don't forget your items!")
