import httpx
import jwt
import time
from app.config import settings


class BackendClient:
    def __init__(self):
        self.client = httpx.AsyncClient(
            base_url=settings.BACKEND_URL,
            timeout=30,
            transport=httpx.AsyncHTTPTransport(retries=3),  # httpx equivalent of your urllib3 Retry
        )

    async def _auth_headers(self):
        token = jwt.encode(
            {"sub": "agent", "role": "agent", "exp": int(time.time()) + 300},  # scoped down, not ADMIN
            settings.SECRET_KEY, algorithm="HS256",
        )
        return {"Authorization": f"Bearer {token}"}

    async def search_products(self, query: str):
        r = await self.client.get("/api/product/", params={"search": query})
        r.raise_for_status()
        return r.json()

    async def check_order_status(self, order_number: str) -> dict:
        headers = await self._auth_headers()
        r = await self.client.get(f"/api/order/{order_number.strip().lstrip('#').upper()}", headers=headers)
        r.raise_for_status()
        return r.json()

    async def check_stock(self, product_slug: str) -> dict:
        headers = await self._auth_headers()
        r = await self.client.get(f"/api/product/{product_slug.strip().lower()}", headers=headers)
        r.raise_for_status()
        return r.json()

backend = BackendClient()
