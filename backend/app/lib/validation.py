import re
from typing import Optional
from pydantic import AfterValidator
from typing_extensions import Annotated


def validate_phone(value: Optional[str]) -> Optional[str]:
    if not value:
        return value
    digits: str = re.sub(r"\D", "", value)
    # Normalize to 234XXXXXXXXXX
    if digits.startswith("0"):
        digits = "234" + digits[1:]
    if not digits.startswith("234"):
        raise ValueError("Invalid phone number")
    # Must match valid NG mobile pattern
    if not re.fullmatch(r"234[789][01]\d{8}", digits):
        raise ValueError("Invalid mobile number")
    return digits  # canonical format

PhoneNumber = Annotated[Optional[str], AfterValidator(validate_phone)]
