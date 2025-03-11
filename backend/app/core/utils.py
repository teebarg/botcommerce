import random
import re
import string
import unicodedata
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

import emails  # type: ignore
from firebase_cart import Order
from jinja2 import Environment, FileSystemLoader, Template

from app.core.config import settings
from app.core.logging import logger
from app.models.user import User


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
    return f"https://firebasestorage.googleapis.com/v0/b/shopit-ebc60.appspot.com/o/products%2F{image}?alt=media"


def url_to_list(url: str) -> list[str]:
    return [f'{item.replace("-", " ")}' for item in url.split(",")]


def slugify(text) -> str:
    """
    Convert a string into a URL-friendly slug.
    Removes special characters, converts to lowercase, and replaces spaces with hyphens.

    Args:
        text (str): The input string to convert

    Returns:
        str: The slugified string
    """
    # Convert to lowercase
    text = text.lower()

    # Replace spaces with hyphens
    text = text.replace(' ', '-')

    # Remove special characters, keeping only alphanumeric and hyphens
    slug = ''.join(char for char in text if char.isalnum() or char == '-')

    # Remove multiple consecutive hyphens
    while '--' in slug:
        slug = slug.replace('--', '-')

    # Remove leading/trailing hyphens
    slug = slug.strip('-')

    return slug


def render_email_template(*, template_name: str, context: dict[str, Any]) -> str:
    # Set up Jinja2 environment and add the custom filter
    template_path = Path(__file__).parent.parent / "email-templates" / "build"
    env = Environment(loader=FileSystemLoader(template_path))
    env.filters["naira"] = format_naira
    env.filters["image"] = format_image

    # Load and render the template
    template = env.get_template(template_name)
    return template.render(context)


def render_email_template2(*, template_name: str, context: dict[str, Any]) -> str:
    template_str = (
        Path(__file__).parent.parent / "email-templates" / "build" / template_name
    ).read_text()
    html_content = Template(template_str).render(context)
    return html_content


def send_email(
    *,
    email_to: str,
    subject: str = "",
    html_content: str = "",
) -> None:
    if not settings.EMAILS_ENABLED:
        return
    message = emails.Message(
        subject=subject,
        html=html_content,
        mail_from=(settings.EMAILS_FROM_NAME, settings.EMAILS_FROM_EMAIL),
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


def generate_test_email(email_to: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Test email"
    html_content = render_email_template(
        template_name="test_email.html",
        context={"project_name": settings.PROJECT_NAME, "email": email_to},
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_invoice_email(order: Order, user: User) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Order Confirmation"
    html_content = render_email_template(
        template_name="invoice.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "order": order,
            "user": user,
            "current_year": datetime.now().year,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_new_account_email(
    email_to: str, username: str, password: str
) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - New account for user {username}"
    html_content = render_email_template(
        template_name="new_account.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "username": username,
            "password": password,
            "email": email_to,
            "link": settings.server_host,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_data_export_email(download_link: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Your Data Export is Ready"
    html_content = render_email_template(
        template_name="data_export.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "download_link": download_link,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_contact_form_email(
    name: str, email: str, phone: str, message: str
) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - New Contact Email"
    html_content = render_email_template(
        template_name="contact_form.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "name": name,
            "email": email,
            "phone": phone,
            "message": message,
            "current_year": datetime.now().year,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_newsletter_email(email: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - New Newsletter Email"
    html_content = render_email_template(
        template_name="newsletter.html",
        context={
            "project_name": settings.PROJECT_NAME,
            "email": email,
            "project_website": settings.DOMAIN,
            "unsubscribe_link": "",
            "current_year": datetime.now().year,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_slug(name: str) -> str:
    # Convert to lowercase
    name = name.lower()

    # Remove accents
    name = unicodedata.normalize("NFKD", name).encode("ASCII", "ignore").decode("ASCII")

    # Replace spaces with hyphens
    name = re.sub(r"\s+", "-", name)

    # Remove all other special characters
    name = re.sub(r"[^a-z0-9\-]", "", name)

    # Remove multiple hyphens
    name = re.sub(r"-+", "-", name)

    # Remove leading and trailing hyphens
    name = name.strip("-")

    return name


def generate_id(prefix="cart_", length=25):
    chars = string.ascii_uppercase + string.digits
    unique_part = "".join(random.choice(chars) for _ in range(length))
    return prefix + unique_part
