
import hashlib
import hmac
import time
from fastapi import Header, HTTPException, Request
from passlib.context import CryptContext

from app.core.config import settings
from app.core.logging import logger

MAX_CLOCK_SKEW_SECONDS = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def sign_request(secret: str, method: str, path: str, body: bytes, timestamp: str) -> str:
    """
    Signs method + path + body + timestamp so the signature is bound to
    this exact request — can't be replayed against a different endpoint
    or with a tampered body, and expires naturally via the timestamp check.
    """
    message = f"{method}|{path}|{timestamp}|".encode() + body
    return hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()


def verify_request(secret: str, method: str, path: str, body: bytes, timestamp: str, signature: str) -> bool:
    try:
        ts = int(timestamp)
    except (TypeError, ValueError):
        return False

    if abs(time.time() - ts) > MAX_CLOCK_SKEW_SECONDS:
        return False  # too old — likely a replay, or wildly wrong clock

    expected: str = sign_request(secret, method, path, body, timestamp)
    return hmac.compare_digest(expected, signature)


async def verify_internal_signature(
    request: Request,
    x_signature: str = Header(...),
    x_timestamp: str = Header(...),
):
    body = await request.body()
    valid = verify_request(
        secret=settings.INTERNAL_WORKER_SECRET,
        method=request.method,
        path=request.url.path,
        body=body,
        timestamp=x_timestamp,
        signature=x_signature,
    )
    if not valid:
        logger.warning(
            f"Rejected internal request: invalid signature "
            f"from {request.client.host} on {request.url.path}"
        )
        raise HTTPException(status_code=403, detail="Forbidden")
