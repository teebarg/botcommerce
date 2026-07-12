import asyncio
import base64
import random
import xml.etree.ElementTree as ET
from typing import List, Optional, Any, Dict
from collections import Counter
from app.services.cache import CacheService, cacheable
from fastapi import HTTPException, Request
from prisma.enums import PaymentStatus
from meilisearch.errors import MeilisearchApiError
from app.prisma_client import prisma as db
from app.core.config import settings
from app.core.logging import get_logger
from app.core.utils import url_to_list
from app.models.product import Product
from app.services.search import SearchService
from app.lib.cache import purge_vercel_tags, purge_cdn_urls

logger = get_logger(__name__)

PRODUCT_ATTRIBUTES: list[str] = ["id", "name", "sku", "image", "slug", "active", "is_new", "status", "variants"]

class ProductService:
    def __init__(self, db, redis, search_srv: SearchService, cache_srv: CacheService):
        self.db = db
        self.redis = redis
        self.search_srv = search_srv
        self.cache_srv = cache_srv

    async def get_by_slug(self, slug: str):
        return await self.db.product.find_unique(
            where={"slug": slug},
            include={"variants": True, "images": True}
        )

    async def check_review_status(self, user_id: int, product_id: int) -> tuple[bool, bool]:
        purchase_count_task = self.db.order.count(
            where={
                "user_id": user_id,
                "payment_status": PaymentStatus.SUCCESS,
                "order_items": {"some": {"variant": {"product_id": product_id}}}
            }
        )
        review_count_task = self.db.review.count(
            where={"user_id": user_id, "product_id": product_id}
        )
        purchase_count, review_count = await asyncio.gather(purchase_count_task, review_count_task)
        return purchase_count > 0, review_count > 0

    async def get_variant(self, variant_id: int):
        return await self.db.productvariant.find_unique(where={"id": variant_id})

    async def update_variant(self, variant_id: int, update_data: Any):
        return await self.db.productvariant.update(where={"id": variant_id}, data=update_data)

    @cacheable(key_prefix="merchant_feed", key_builder=False)
    async def generate_merchant_feed_xml(self, request: Request) -> str:
        """
        Generates Google Merchant Feed.
        Optimized to process 20k+ records in batches to keep memory footprints low.
        """
        rss = ET.Element("rss", version="2.0")
        rss.set("xmlns:g", "http://base.google.com/ns/1.0")
        channel = ET.SubElement(rss, "channel")
        ET.SubElement(channel, "title").text = "Thriftbyoba Product Feed"
        ET.SubElement(channel, "link").text = settings.FRONTEND_HOST
        ET.SubElement(channel, "description").text = "Automated product sync feed for Google Merchant Center"

        batch_size = 1000
        skip = 0

        while True:
            products = await self.db.product.find_many(
                where={"active": True},
                include={"variants": True, "images": True},
                take=batch_size,
                skip=skip
            )
            if not products:
                break

            for prod in products:
                for variant in prod.variants:
                    item = ET.SubElement(channel, "item")
                    ET.SubElement(item, "g:id").text = variant.sku

                    variant_title = prod.name or ""
                    if variant.color or variant.size:
                        variant_title += f" ({' / '.join(filter(None, [variant.color, variant.size]))})"

                    ET.SubElement(item, "g:title").text = variant_title.strip()
                    ET.SubElement(item, "g:description").text = prod.description or "No description provided."
                    ET.SubElement(item, "g:link").text = f"{settings.FRONTEND_HOST}/products/{prod.slug}"

                    main_image = prod.image or (prod.images[0].image if prod.images else f"{settings.FRONTEND_HOST}/placeholder.jpg")
                    ET.SubElement(item, "g:image_link").text = main_image
                    ET.SubElement(item, "g:availability").text = "in_stock" if variant.inventory > 0 else "out_of_stock"
                    ET.SubElement(item, "g:price").text = f"{variant.price:.2f} NGN"
                    ET.SubElement(item, "g:condition").text = "new" if prod.is_new else "thrift"

                    if variant.size: ET.SubElement(item, "g:size").text = variant.size
                    if variant.color: ET.SubElement(item, "g:color").text = variant.color
                    if variant.age: ET.SubElement(item, "g:age_group").text = variant.age

            skip += batch_size
            await asyncio.sleep(0.01)  # Yield loop to allow other network requests to process

        xml_str = ET.tostring(rss, encoding="utf-8", method="xml").decode("utf-8")
        return f'<?xml version="1.0" encoding="utf-8"?>\n{xml_str}'

    async def get_similar_products(self, product_id: int, limit: int) -> list:
        key: str = f"product:{product_id}:similar"
        ids = await self.redis.lrange(key, 0, -1)
        if not ids:
            return []

        ids = ids[:limit]

        documents = self.search_srv.get_documents_by_filter(
            f"id IN [{','.join(ids)}]", limit
        )

        documents = [dict(doc) for doc in documents]

        # re-sort here using the Redis order (which IS the similarity ranking)
        order_map = {int(pid): idx for idx, pid in enumerate(ids)}
        documents.sort(key=lambda doc: order_map.get(doc["id"], len(ids)))

        return documents

    async def get_personalized_recommendations(self, user_id: int, limit: int) -> list:
        product_ids = await self.redis.lrange(f"user:{user_id}:history", 0, 4)
        if not product_ids:
            return []

        recommendation_scores = Counter()
        seen = set(product_ids)

        for pid in product_ids:
            similar_ids = await self.redis.lrange(f"product:{pid}:similar", 0, -1)
            for sid in similar_ids:
                if sid not in seen:
                    recommendation_scores[sid] += 1

        if not recommendation_scores:
            return []

        top_ids = [pid for pid, _ in recommendation_scores.most_common(10)]
        filter_str = " OR ".join([f"id = {pid}" for pid in top_ids])

        results = await self.search_srv.search_index("", {"filter": filter_str, "limit": limit, "attributesToRetrieve": PRODUCT_ATTRIBUTES})
        return results["hits"]

    async def get_discovery_feed(self, **kwargs) -> Dict[str, Any]:
        search = kwargs.get("search", "")
        limit = kwargs.get("limit", 20)
        cursor = kwargs.get("cursor")
        sort = kwargs.get("sort", "id:desc")

        offset = 0
        if cursor:
            try:
                offset = int(self._decode_cursor(cursor))
            except (ValueError, TypeError):
                offset = 0

        base_filters: list[str] = self._build_search_filters_list(kwargs)
        disable_random_feed: bool = self._has_active_filters(kwargs) or bool(search)

        search_params: Dict[str, Any] = {"limit": limit, "offset": offset, "attributesToRetrieve": PRODUCT_ATTRIBUTES}
        if base_filters:
            search_params["filter"] = " AND ".join(base_filters)

        search_params["sort"] = [sort] if disable_random_feed else ["random_score:asc"]

        try:
            res = await self.search_srv.search_index(search if disable_random_feed else "", search_params)
            hits = res["hits"]
            total_count = res["estimatedTotalHits"]
        except Exception as e:
            logger.error(f"Meilisearch cluster error: {e}")
            raise HTTPException(status_code=502, detail="Search service unavailable")

        next_cursor = None
        next_offset = offset + len(hits)
        if next_offset < total_count and len(hits) == limit:
            next_cursor = self._encode_cursor(str(next_offset))

        return {
            "products": hits,
            "limit": limit,
            "total_count": total_count,
            "next_cursor": next_cursor,
        }

    async def query_collection_index(self) -> dict:
        collections = ["trending", "new-arrivals", "featured"]

        async def fetch_collection(col: str):
            search_params = {
                "limit": 6 if col == "trending" else 8,
                "sort": ["id:desc"],
                "filter": f'active = true AND collection_slugs = "{col}"',
                "attributesToRetrieve": PRODUCT_ATTRIBUTES
            }
            try:
                res = await self.search_srv.search_index("", search_params)
            except MeilisearchApiError as e:
                if getattr(e, "code", None) in {"invalid_search_filter", "invalid_search_sort"}:
                    await self.search_srv.ensure_index_ready()
                    res = await self.search_srv.search_index("", search_params)
                else:
                    raise HTTPException(status_code=502, detail="Search service communication error")

            key_name: str = "arrival" if col == "new-arrivals" else col
            return key_name, res.get("hits", [])

        tasks = [fetch_collection(col) for col in collections]
        completed_tasks = await asyncio.gather(*tasks)

        return {key: hits for key, hits in completed_tasks}

    def _has_active_filters(self, kw) -> bool:
        return any([
            kw.get("search"), kw.get("cat_ids"), kw.get("collections"), kw.get("sizes"),
            kw.get("colors"), kw.get("ages"), kw.get("width"), kw.get("length"),
            kw.get("min_price", 1) != 1, kw.get("max_price", 50000) != 50000
        ])

    def _build_search_filters_list(self, kw) -> list[str]:
        filters = []
        if kw.get("cat_ids"): filters.append(f"category_slugs IN {url_to_list(kw['cat_ids'])}")
        if kw.get("collections"): filters.append(f"collection_slugs IN [{kw['collections']}]")
        if kw.get("min_price") and kw.get("max_price"):
            filters.append(f"min_variant_price >= {kw['min_price']} AND max_variant_price <= {kw['max_price']}")
        filters.append(f"active = {str(kw.get('active', True)).lower()}")
        if kw.get("sizes"): filters.append(f"sizes IN [{kw['sizes']}]")
        if kw.get("colors"): filters.append(f"colors IN [{kw['colors']}]")
        if kw.get("ages"): filters.append(f'ages IN ["{kw["ages"]}"]')
        if kw.get("width"): filters.append(f"widths IN [{kw['width']}]")
        if kw.get("length"): filters.append(f"lengths IN [{kw['length']}]")
        return filters

    def _encode_cursor(self, value: str) -> str:
        """Encodes a plain string value (like an offset integer) into a URL-safe base64 string."""
        return base64.urlsafe_b64encode(value.encode()).decode()

    def _decode_cursor(self, cursor: str) -> str:
        """Decodes a URL-safe base64 string back into its original plain string value."""
        try:
            return base64.urlsafe_b64decode(cursor.encode()).decode()
        except Exception:
            return "0"

    def _prepare_product_data_for_indexing(self, product: Product) -> dict:
        product_dict: dict = {
            "id": product.id,
            "name": product.name,
            "slug": product.slug,
            "description": product.description,
            "sku": product.sku,
            "active": product.active,
            "is_new": getattr(product, "is_new", False),
            "random_score": random.random(),
        }

        product_dict["collection_slugs"] = [c.slug for c in (product.collections or [])]
        product_dict["category_slugs"] = [c.slug for c in (product.categories or [])]

        images = [img.image for img in sorted((product.images or []), key=lambda img: img.order)]
        product_dict["image"] = images[0] if images else None

        variants = [
            {
                "id": v.id,
                "price": v.price,
                "old_price": v.old_price,
                "inventory": v.inventory,
                "size": v.size,
                "color": v.color,
                "age": v.age,
                "width": v.width,
                "length": v.length,
                "status": v.status,
            }
            for v in (product.variants or [])
        ]
        product_dict["variants"] = variants

        sizes, colors, ages, widths, lengths = [], [], [], [], []
        for v in variants:
            if v.get("size"):   sizes.append(v["size"])
            if v.get("color"):  colors.append(v["color"])
            if v.get("age"):    ages.append(v["age"])
            if v.get("width"):  widths.append(v["width"])
            if v.get("length"): lengths.append(v["length"])

        product_dict["sizes"] = sizes
        product_dict["colors"] = colors
        product_dict["ages"] = ages
        product_dict["widths"] = widths
        product_dict["lengths"] = lengths

        variant_prices = [v["price"] for v in variants if v.get("price") is not None]
        product_dict["min_variant_price"] = min(variant_prices) if variant_prices else 0
        product_dict["max_variant_price"] = max(variant_prices) if variant_prices else 0

        product_dict["status"] = (
            "IN STOCK" if any(v["inventory"] > 0 for v in variants) else "OUT OF STOCK"
        )

        return product_dict

    async def invalidate(self, id: int) -> None:
        try:
            product = await db.product.find_unique(
                where={"id": id},
                include={
                    "categories": True,
                    "collections": True,
                    "variants": True,
                    "images": True,
                    "shared_collections": True,
                }
            )

            if not product:
                logger.warning(f"Product with id {id} not found for re-indexing.")
                return

            product_data = self._prepare_product_data_for_indexing(product=product)
            await self.search_srv.update_document(index_name=settings.MEILI_PRODUCTS_INDEX, document=product_data)
            await self.cache_srv.invalidate(f"product:{product.slug}", tags=["products", "catalog", f"product:{id}"])
            await purge_vercel_tags(f"product:{product.slug}", "products")
            await purge_cdn_urls(f"/product/{product.slug}")
        except Exception as e:
            logger.error(f"Error re-indexing product {id}: {e}")


    async def invalidate_all(self, product_ids: Optional[List[int]] = None, existing_product_ids: Optional[List[int]] = None):
        """
        Re-indexes database products.
        """
        try:
            logger.debug("Starting re-indexing process...")
            if product_ids:
                products = await db.product.find_many(
                    where={"id": {"in": product_ids}},
                    include={
                        "categories": True,
                        "collections": True,
                        "variants": True,
                        "images": True,
                        "shared_collections": True,
                    }
                )
                if not products:
                    logger.warning(f"Products with ids {product_ids} not found for re-indexing.")
                    return

                documents = [self._prepare_product_data_for_indexing(p) for p in products]
                await self.search_srv.add_documents_to_index(index_name=settings.MEILI_PRODUCTS_INDEX, documents=documents)
                existing_set = set(existing_product_ids or [])
                keys: str = ",".join(
                    f"product:{product_id}"
                    for product_id in product_ids
                    if product_id in existing_set
                )
                key_paths: str = ",".join(
                    f"/product/{p.slug}"
                    for p in products
                    if p.id in existing_set
                )
                print(key_paths)
                await self.cache_srv.invalidate(keys, tags=["products", "catalog", "gallery"] + ["stats-trends"] if len(product_ids) > 0 else [] )
                await purge_vercel_tags(keys, "products")
                await purge_cdn_urls(key_paths)
                logger.debug(f"Successfully targeted indexed {len(documents)} products")
                return

            # Full Index Rebuild in Chunks
            logger.debug("Clearing search index for clean sync...")
            await self.search_srv.clear_index(index_name=settings.MEILI_PRODUCTS_INDEX)

            BATCH_SIZE = 500
            skip = 0
            total_processed = 0

            while True:
                products_batch = await db.product.find_many(
                    include={
                        "categories": True,
                        "collections": True,
                        "variants": True,
                        "images": True,
                        "shared_collections": True,
                    },
                    where={"active": True},
                    take=BATCH_SIZE,
                    skip=skip
                )
                if not products_batch:
                    break

                documents = []
                for product in products_batch:
                    try:
                        product_data = self._prepare_product_data_for_indexing(product)
                        documents.append(product_data)
                    except Exception as e:
                        logger.error(f"Error preparing product model {product.id}: {e}")

                if documents:
                    await self.search_srv.add_documents_to_index(index_name=settings.MEILI_PRODUCTS_INDEX, documents=documents)

                total_processed += len(documents)
                logger.debug(f"Indexed batch chunk: {skip // BATCH_SIZE + 1} ({len(documents)} records added)")

                skip += BATCH_SIZE
                await asyncio.sleep(0.05)  # Yield block back to application loop thread

            await self.cache_srv.invalidate(tags=["products", "catalog"])
            await purge_vercel_tags("products")
            logger.debug(f"Successfully batch indexed total of {total_processed} products")

        except Exception as e:
            logger.error(f"Critical error during product re-indexing: {e}")


    async def delete_product_index(self, product_ids: List[int]) -> None:
        try:
            if len(product_ids) == 0:
                return
            await asyncio.gather(*[
                self.search_srv.delete_document(index_name=settings.MEILI_PRODUCTS_INDEX, document_id=str(pid))
                for pid in product_ids
            ])
            key: str=",".join(f"product:{id}" for id in product_ids)
            await self.cache_srv.invalidate(key, tags=["products", "catalog", "stats-trends"])
            await purge_vercel_tags("products")
        except Exception as e:
            logger.error(f"Error deleting products {product_ids} from index: {e}")
