import hashlib
import hmac
import json
import httpx

PAYSTACK_SECRET_KEY = "sk_test_...."
WEBHOOK_URL = "http://localhost:5101/api/payment/webhooks/paystack"

payload = {
    "event": "charge.success",
    "data": {
        "reference": "CART-1-1785500706.0",  # match a real cart_number format
        "amount": 500000,  # kobo — 5000.00
        "metadata": {
            "cart_number": "cart_EY4U211LA5X19XD77ALUJVTSF",
            "user_id": 1,
            "cart_id": 1,
        },
    },
}

body = json.dumps(payload, separators=(",", ":")).encode()
signature = hmac.new(PAYSTACK_SECRET_KEY.encode(), body, hashlib.sha512).hexdigest()

resp = httpx.post(
    WEBHOOK_URL,
    content=body,
    headers={
        "Content-Type": "application/json",
        "x-paystack-signature": signature,
    },
)
print(resp.status_code, resp.text)