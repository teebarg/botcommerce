import httpx

from app.config import settings


class BackendClient:

    def __init__(self):
        self.client = httpx.AsyncClient(
            base_url=settings.backend_url,
            timeout=30,
        )

    async def search_products(
        self,
        query: str,
    ):
        r = await self.client.get(
            "/products",
            params={
                "search": query,
            },
        )

        r.raise_for_status()

        return r.json()

    async def get_order(
        self,
        order_number: str,
    ):
        r = await self.client.get(
            f"/orders/{order_number}"
        )

        r.raise_for_status()

        return r.json()


backend = BackendClient()