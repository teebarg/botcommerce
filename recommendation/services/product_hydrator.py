from typing import List
from redis import Redis
from models import SearchProduct
from meilisearch import Client as MeiliClient
import json
import logging
from config import settings
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

DEFAULT_EXPIRATION = int(timedelta(hours=24).total_seconds())

class EnhancedJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime):
            return o.isoformat()
        try:
            return o.__dict__
        except Exception:
            return str(o)

class ProductHydrator:
    def __init__(self, redis_client: Redis, meili_client: MeiliClient):
        self.redis = redis_client
        self.meili = meili_client
        self.index = meili_client.index(settings.MEILI_PRODUCTS_INDEX)

    def _cache_key(self, product_id: int) -> str:
        return f"product:{product_id}"

    async def cache_product(self, product: SearchProduct, ttl: int = DEFAULT_EXPIRATION):
        raw_key = self._cache_key(product.id)
        await self.redis.setex(raw_key, ttl, json.dumps(product, cls=EnhancedJSONEncoder))

    async def get_from_cache(self, product_id: int) -> SearchProduct | None:
        raw_key = self._cache_key(product_id)
        cached = await self.redis.get(raw_key)
        if cached:
            try:
                return SearchProduct(**json.loads(cached))
            except Exception as e:
                logger.warning(f"Failed to parse cached product {product_id}: {e}")
        return None

    async def hydrate_products(self, product_ids: List[int]) -> List[SearchProduct]:
        results = []

        for pid in product_ids:
            product = await self.get_from_cache(pid)
            if product:
                results.append(product)

        missing_ids = [pid for pid in product_ids if pid not in [p.id for p in results]]

        if len(missing_ids) > 0:
            try:
                # hits = self.index.get_documents({
                #     "filter": f"id IN [{','.join(map(str, missing_ids))}]",
                #     "limit": len(missing_ids)
                # })
                search_results = self.index.search(
                    "",
                    {
                        "filter": f"id IN [{','.join(map(str, missing_ids))}]",
                        "limit": len(missing_ids)
                    }
                )

                products_map = {p["id"]: p for p in search_results["hits"]}
                for pid in missing_ids:
                    if pid in products_map:
                        try:
                            product = SearchProduct(**products_map[pid])
                            results.append(product)
                            await self.cache_product(product)
                        except Exception as e:
                            logger.warning(f"Error parsing Meili product {pid}: {e}")
            except Exception as e:
                logger.error(f"Failed to hydrate from Meilisearch: {e}")

        # Sort according to original order
        results.sort(key=lambda p: product_ids.index(p.id))
        return results
