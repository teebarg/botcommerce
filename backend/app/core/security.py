from datetime import datetime, timedelta, timezone
from typing import Union
import jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode = {"exp": expire, **data}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def create_magic_link_token(email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=30)  # Magic links expire in 30 minutes
    to_encode = {"exp": expire, "sub": email, "type": "magic_link"}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_magic_link_token(token: str) -> Union[str, None]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "magic_link":
            return None
        return payload.get("sub")
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None

def create_email_verification_token(email: str) -> str:
    """Create a token for email verification"""
    to_encode = {"sub": email, "type": "email_verification"}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_email_token(token: str) -> str | None:
    """Verify an email verification token and return the email if valid"""
    try:
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        if decoded_token.get("type") != "email_verification":
            return None
        return decoded_token.get("sub")
    except jwt.JWTError:
        return None
