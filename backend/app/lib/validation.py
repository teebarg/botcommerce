import re
from typing import Optional

def normalize_phone(phone: Optional[str]) -> Optional[str]:
    if not phone:
        return None

    digits = re.sub(r"\D", "", phone)

    if not digits:
        return None

    if digits.startswith("0"):
        digits = "234" + digits[1:]

    if not digits.startswith("234") and not digits.startswith("+"):
        digits = digits

    return f"+{digits}"