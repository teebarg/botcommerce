import time
import httpx
from app.config import settings
from app.security import sign_request
from app.logger import logger


async def generate_and_send_invoice(ctx, order_id: int) -> dict:
    path = f"/api/internal/orders/{order_id}/generate-invoice"
    body = b""  # no request body on this endpoint
    timestamp = str(int(time.time()))
    signature = sign_request(
        settings.INTERNAL_WORKER_SECRET, "POST", path, body, timestamp
    )

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            resp = await client.post(
                f"{settings.API_BASE_URL}{path}",
                headers={"X-Signature": signature, "X-Timestamp": timestamp},
            )
            resp.raise_for_status()
            result = resp.json()
            logger.info(f"Invoice generated for order {order_id}: {result.get('invoice_url')}")
            return result
        except httpx.HTTPStatusError as e:
            logger.error(f"Invoice generation failed for order {order_id}: {e.response.status_code} {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Invoice generation request failed for order {order_id}: {e}")
            raise