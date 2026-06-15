import asyncio
import json
import base64
import random
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from typing import List, Optional, Any
from collections import Counter
from app.services.cache import CacheService, cacheable
from fastapi import HTTPException, Request

from app.prisma_client import prisma as db
from app.core.config import settings
from app.core.logging import get_logger
from app.core.utils import url_to_list
from app.models.product import Product
from prisma.enums import PaymentStatus
from json import JSONEncoder
from uuid import UUID

from meilisearch import Client
from meilisearch.errors import MeilisearchApiError
from anyio import to_thread


client = Client(settings.MEILI_HOST, settings.MEILI_MASTER_KEY)

REQUIRED_FILTERABLES: list[str] = ["id", "category_slugs", "collection_slugs", "name", "max_variant_price", "min_variant_price", "active", "sizes", "colors", "ages", "widths", "lengths", "random_score", "freshness_score"]
REQUIRED_SORTABLES: list[str] = ["id", "created_at", "max_variant_price", "min_variant_price", "random_score", "freshness_score"]

logger = get_logger(__name__)

# =====================================================================
# ROUTE LOGIC SERVICE LAYERS (Clean Architecture)
# =====================================================================

class CustomEncoder(JSONEncoder):
    def default(self, o):
        if isinstance(o, (UUID, datetime)):
            return str(o)
        return super().default(o)

def get_or_create_index(index_name: str) -> Any:
    """
    Get or create a Meilisearch index.
    """
    try:
        return client.get_index(index_name)
    except MeilisearchApiError as e:
        logger.error(f"MeilisearchApiError: {index_name}")
        error_code = getattr(e, "code", None)
        if error_code == "index_not_found":
            index = client.index(index_name)
            logger.error(f"Index {index_name} not found")
            create_task = client.create_index(uid=index_name)
            index.wait_for_task(create_task.task_uid)

            filter_task = index.update_filterable_attributes(REQUIRED_FILTERABLES)
            index.wait_for_task(filter_task.task_uid)

            sort_task = index.update_sortable_attributes(REQUIRED_SORTABLES)
            index.wait_for_task(sort_task.task_uid)
            return index
    except Exception as e:
        logger.error(f"Error creating index {index_name}: {e}")
        client.create_index(index_name)
        return client.index(index_name)


class SearchRepository:
    def __init__(self):
        self.index = get_or_create_index(settings.MEILI_PRODUCTS_INDEX)

    def ensure_index_ready(self):
        """
        Ensures that the given Meilisearch index has the required
        filterable and sortable attributes.
        """
        filter_task = self.index.update_filterable_attributes(REQUIRED_FILTERABLES)
        self.index.wait_for_task(filter_task.task_uid)

        sort_task = self.index.update_sortable_attributes(REQUIRED_SORTABLES)
        self.index.wait_for_task(sort_task.task_uid)

    def search_index(self, query: str, options: dict) -> dict:
        return self.index.search(query, options)

    def get_documents_by_filter(self, filter_str: str, limit: int) -> list:
        results = self.index.get_documents({"filter": filter_str, "limit": limit})
        return results.results

    async def update_document(self, index_name: str, document: dict) -> None:
        """
        Update a document in a Meilisearch index and wait for completion.
        """
        def _update():
            task = self.index.update_documents([document], serializer=CustomEncoder)
            self.index.wait_for_task(task.task_uid, timeout_in_ms=30000)
            return task

        task = await to_thread.run_sync(_update)
        logger.debug(f"Updated document {document['id']} in index {index_name}, task: {task.task_uid}")

    async def add_documents_to_index(self, index_name: str, documents: list) -> None:
        """
        Add documents to a Meilisearch index and wait for completion.
        """
        def _add():
            task = self.index.add_documents(documents, primary_key="id", serializer=CustomEncoder)
            self.index.wait_for_task(task.task_uid, timeout_in_ms=30000)
            return task

        task = await to_thread.run_sync(_add)
        logger.debug(f"Added {len(documents)} documents to index {index_name}, task: {task.task_uid}")

    async def delete_document(self, index_name: str, document_id: str) -> None:
        """
        Delete a document from a Meilisearch index and wait for completion.
        """
        def _delete():
            task = self.index.delete_document(document_id)
            self.index.wait_for_task(task.task_uid, timeout_in_ms=30000)
            return task

        task = await to_thread.run_sync(_delete)
        logger.debug(f"Deleted document {document_id} from index {index_name}, task: {task.task_uid}")

    async def clear_index(self, index_name: str) -> None:
        """
        Clear all documents from a Meilisearch index and wait for completion.
        """
        def _clear():
            task = self.index.delete_all_documents()
            self.index.wait_for_task(task.task_uid, timeout_in_ms=30000)
            return task

        task = await to_thread.run_sync(_clear)
        logger.debug(f"Cleared index {index_name}, task: {task.task_uid}")

    def update_settings(self):
        self.index.update_filterable_attributes(REQUIRED_FILTERABLES)
        self.index.update_sortable_attributes(REQUIRED_SORTABLES)


class ProductService:
    def __init__(self, db, redis, search_repo: SearchRepository, cache_srv: CacheService):
        self.db = db
        self.redis = redis
        self.search_repo = search_repo
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
        key = f"product:{product_id}:similar"
        ids = await self.redis.lrange(key, 0, -1)
        if not ids:
            return []
        return self.search_repo.get_documents_by_filter(f"id IN [{','.join(ids)}]", limit)

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
        
        results = self.search_repo.search_index("", {"filter": filter_str, "limit": limit})
        return results["hits"]

    async def get_discovery_feed(self, **kwargs) -> dict:
        search = kwargs.get("search", "")
        limit = kwargs.get("limit", 20)
        skip_offset = kwargs.get("skip_offset", 0)
        cursor = kwargs.get("cursor")
        feed_seed = kwargs.get("feed_seed") or random.random()
        show_suggestions = kwargs.get("show_suggestions", False)
        show_facets = kwargs.get("show_facets", False)
        sort = kwargs.get("sort", "id:desc")

        base_filters = self._build_search_filters_list(kwargs)
        disable_random_feed = self._has_active_filters(kwargs)

        offset = skip_offset
        cursor_filter = ""
        if cursor:
            c = self._decode_cursor(cursor)
            if disable_random_feed:
                offset = c.get("offset", 0)
            else:
                cursor_filter = f"(random_score > {c['r']} OR (random_score = {c['r']} AND freshness_score < {c['f']}) OR (random_score = {c['r']} AND freshness_score = {c['f']} AND id > {c['id']}))"

        try:
            if not disable_random_feed:
                filters = " AND ".join(f for f in [f"random_score >= {feed_seed}", cursor_filter, *base_filters] if f)
                res = self.search_repo.search_index("", {
                    "limit": limit, "sort": ["random_score:asc", "freshness_score:desc", "id:desc"], "filter": filters
                })
                hits = res["hits"]
                total_count = res["estimatedTotalHits"]

                if len(hits) < limit and not cursor:
                    wrap_filters = " AND ".join(f for f in [f"random_score < {feed_seed}", *base_filters] if f)
                    wrap_res = self.search_repo.search_index("", {
                        "limit": limit - len(hits), "sort": ["random_score:asc", "freshness_score:desc", "id:desc"], "filter": wrap_filters
                    })
                    hits.extend(wrap_res["hits"])
                    total_count += wrap_res["estimatedTotalHits"]
            else:
                search_params = {"limit": limit, "offset": offset, "sort": [sort]}
                if base_filters:
                    search_params["filter"] = " AND ".join(base_filters)
                if show_facets:
                    search_params["facets"] = ["category_slugs", "sizes", "colors", "ages", "widths", "lengths"]

                res = self.search_repo.search_index(search, search_params)
                hits = res["hits"]
                total_count = res["estimatedTotalHits"]

            suggestions = []
            if show_suggestions and search:
                s_res = self.search_repo.search_index(search, {"limit": 4, "attributesToRetrieve": ["name"], "matchingStrategy": "all"})
                suggestions = list({h["name"] for h in s_res["hits"] if "name" in h})

        except MeilisearchApiError as e:
            logger.error(f"Meilisearch cluster error: {e}")
            raise HTTPException(status_code=502, detail="Search service temporarily unavailable")

        next_cursor = None
        if hits and total_count > (offset + limit):
            next_cursor = self._encode_cursor(hits[-1]) if not disable_random_feed else self._encode_offset_cursor(offset + limit)

        return {
            "products": hits, "facets": res.get("facetDistribution", {}), "limit": limit,
            "total_count": total_count, "feed_seed": feed_seed, "next_cursor": next_cursor, "suggestions": suggestions
        }

    async def query_collection_index(self) -> dict:
        result = {"arrival": [], "featured": [], "trending": []}
        collections = ["trending", "new-arrivals", "featured"]
        
        for col in collections:
            search_params = {
                "limit": 6 if col == "trending" else 8,
                "sort": ["id:desc"],
                "filter": f'active = true AND collection_slugs = "{col}"'
            }
            try:
                res = self.search_repo.search_index("", search_params)
            except MeilisearchApiError as e:
                if getattr(e, "code", None) in {"invalid_search_facets", "invalid_search_filter", "invalid_search_sort"}:
                    self.search_repo.ensure_index_ready()
                    res = self.search_repo.search_index("", search_params)
                else:
                    raise HTTPException(status_code=502, detail="Search service communication error")
            
            key_name = "arrival" if col == "new-arrivals" else col
            result[key_name] = res["hits"]
        return result

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

    def _encode_cursor(self, hit: dict) -> str:
        return base64.urlsafe_b64encode(json.dumps({"r": hit["random_score"], "f": hit["freshness_score"], "id": hit["id"]}).encode()).decode()

    def _encode_offset_cursor(self, offset: int) -> str:
        return base64.urlsafe_b64encode(json.dumps({"offset": offset}).encode()).decode()

    def _decode_cursor(self, cursor: str) -> dict:
        return json.loads(base64.urlsafe_b64decode(cursor.encode()).decode())

    def _prepare_product_data_for_indexing(self, product: Product) -> dict:
        created_at: Any | None = getattr(product, "created_at", None)
        if created_at:
            age_hours: int = max(
                (datetime.now(timezone.utc) - created_at).total_seconds() / 3600,
                1
            )
            freshness_score: float = round(1 / age_hours, 6)
        else:
            freshness_score = 0

        product_dict: dict = {
            "id": product.id,
            "name": product.name,
            "slug": product.slug,
            "description": product.description,
            "sku": product.sku,
            "active": product.active,
            "is_new": getattr(product, "is_new", False),
            "random_score": random.random(),
            "freshness_score": freshness_score,
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
            await self.search_repo.update_document(index_name=settings.MEILI_PRODUCTS_INDEX, document=product_data)
            await self.cache_srv.invalidate(f"product:{id}", tags=["products", "catalog"])
        except Exception as e:
            logger.error(f"Error re-indexing product {id}: {e}")


    async def invalidate_all(self, product_ids: Optional[List[int]] = None):
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
                await self.search_repo.add_documents_to_index(index_name=settings.MEILI_PRODUCTS_INDEX, documents=documents)
                key=",".join(f"product:{id}" for id in product_ids)
                print("invalidating cache..................")
                print(key)
                await self.cache_srv.invalidate(key, tags=["products", "catalog"])
                logger.debug(f"Successfully targeted indexed {len(documents)} products")
                return

            # Full Index Rebuild in Chunks
            logger.debug("Clearing search index for clean sync...")
            await self.search_repo.clear_index(index_name=settings.MEILI_PRODUCTS_INDEX)

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
                    await self.search_repo.add_documents_to_index(index_name=settings.MEILI_PRODUCTS_INDEX, documents=documents)
                
                total_processed += len(documents)
                logger.debug(f"Indexed batch chunk: {skip // BATCH_SIZE + 1} ({len(documents)} records added)")
                
                skip += BATCH_SIZE
                await asyncio.sleep(0.05)  # Yield block back to application loop thread

            self.cache_srv.invalidate(tags=["products", "catalog"])
            logger.debug(f"Successfully batch indexed total of {total_processed} products")
            
        except Exception as e:
            logger.error(f"Critical error during product re-indexing: {e}")


    async def delete_product_index(self, product_ids: List[int]) -> None:
        try:
            if len(product_ids) == 0:
                return
            await asyncio.gather(*[
                self.search_repo.delete_document(index_name=settings.MEILI_PRODUCTS_INDEX, document_id=str(pid))
                for pid in product_ids
            ])
            key=",".join(f"product:{id}" for id in product_ids)
            await self.cache_srv.invalidate(key, tags=["products", "catalog"])
        except Exception as e:
            logger.error(f"Error deleting products {product_ids} from index: {e}")
