from typing import Any, Optional
import hashlib
import hmac
import time
import json
import httpx
from urllib.parse import urlsplit
from app.config import settings
from app.logger import logger

MAX_CLOCK_SKEW_SECONDS = 60


def sign_request(secret: str, method: str, path: str, body: bytes, timestamp: str) -> str:
    """
    Signs method + path + body + timestamp so the signature is bound to
    this exact request — can't be replayed against a different endpoint
    or with a tampered body, and expires naturally via the timestamp check.
    """
    message = f"{method}|{path}|{timestamp}|".encode() + body
    return hmac.new(secret.encode(), message, hashlib.sha256).hexdigest()

async def call_internal_backend(
    path: str,
    method: str = "POST",
    json_body: Optional[dict] = None,
    timeout: float = 30.0,
    label: Optional[str] = None,
) -> dict[str, Any]:
    label = label or path

    full_url: str = f"{settings.API_BASE_URL}/api{path}"
    # Derive the signed path from the ACTUAL request URL.
    signed_path = urlsplit(full_url).path

    body_bytes = json.dumps(json_body, separators=(",", ":")).encode() if json_body else b""
    timestamp = str(int(time.time()))
    signature: str = sign_request(settings.INTERNAL_WORKER_SECRET, method, signed_path, body_bytes, timestamp)

    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            resp = await client.request(
                method,
                full_url,
                content=body_bytes if json_body else None,
                headers={
                    "X-Signature": signature,
                    "X-Timestamp": timestamp,
                    **({"Content-Type": "application/json"} if json_body else {}),
                },
            )
            resp.raise_for_status()
            result = resp.json()
            logger.info(f"{label}: {result.get('status', 'ok')}")
            return result
        except httpx.HTTPStatusError as e:
            logger.error(f"{label} failed: {e.response.status_code} {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"{label} request failed: {e}")
            raise