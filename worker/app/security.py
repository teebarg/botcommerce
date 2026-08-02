import hashlib
import hmac
import time

MAX_CLOCK_SKEW_SECONDS = 60


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

    expected = sign_request(secret, method, path, body, timestamp)
    return hmac.compare_digest(expected, signature)  # constant-time, avoids timing attacks