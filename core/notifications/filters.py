from datetime import datetime
from typing import Any


def discount(value: Any) -> str:
    """
    Format a coupon discount for display.

    PERCENTAGE -> 10%
    FIXED_AMOUNT -> ₦10,000
    """
    if value is None:
        return ""

    discount_type = getattr(value, "discount_type", None)
    discount_value = getattr(value, "discount_value", 0)

    if discount_type == "PERCENTAGE":
        return f"{discount_value:g}%"

    if discount_type == "FIXED_AMOUNT":
        return f"₦{discount_value:,.0f}"

    return str(discount_value)


def format_naira(value: int) -> str:
    return f"₦{value:,.2f}" if value else "₦0.00"

def normalize_image(image: str) -> str:
    return image.replace("mp4", "webp")


def format_image(image: str) -> str:
    return image

def url_to_list(url: str) -> list[str]:
    return [f'{item}' for item in url.split(",")]

def format_date(date: datetime) -> str:
    return date.strftime("%B %d, %Y")