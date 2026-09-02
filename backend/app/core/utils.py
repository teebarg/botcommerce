import random
import string
from dataclasses import dataclass
from datetime import datetime
from typing import Any

from fastapi import Request

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
