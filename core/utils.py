from datetime import datetime

def format_date(date: datetime) -> str:
    return date.strftime("%B %d, %Y")


def format_naira(amount: float) -> str:
    """Formats a number into a human-readable Naira currency string."""
    try:
        # Format with commas and 2 decimal places, then prepend the Naira sign
        return f"₦{float(amount):,.2f}"
    except (ValueError, TypeError):
        return "₦0.00"