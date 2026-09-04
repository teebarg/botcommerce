import asyncio
import base64
import random
import xml.etree.ElementTree as ET
from collections import Counter
from collections.abc import AsyncIterator, Sequence
from typing import Any, Dict, List

from fastapi import HTTPException, Request
from prisma.enums import PaymentStatus

from app.core.config import settings
from app.core.logging import get_logger
from app.core.search.meilisearch import MeilisearchEngine
from app.core.utils import url_to_list
from app.models.product import Product
from app.services.cache import CacheService, cacheable
from app.services.cdn import CdnService
from prisma import Prisma

logger = get_logger(__name__)

PRODUCT_ATTRIBUTES: list[str] = [
    "id",
    "name",
    "sku",
    "image",
    "images",
    "slug",
    "active",
    "is_new",
    "status",
    "variants",
    "in_stock"
]


class ProductService:
    def __init__(
        self,
        db: Prisma,
        search_engine: MeilisearchEngine,
        cache_srv: CacheService,
        cdn_srv: CdnService,
    ):
        self.db = db
        self.search_engine = search_engine
        self.cache_srv = cache_srv
        self.cdn_srv = cdn_srv
        self.AGE_GROUP_MAP = {
            "0-6 months": "infant",
            "6-12 months": "infant",
            "1-2 years": "toddler",
            "2-3 years": "toddler",
            "3-4 years": "toddler",
            "4-5 years": "toddler",
            "5-6 years": "kids",
            "6-7 years": "kids",
            "7-8 years": "kids",
            "8-9 years": "kids",
            "9-10 years": "kids",
            "10-12 years": "kids",
            "12+ years": "teenager",
        }

    async def get(self, id: int):
        return await self.db.product.find_unique(where={"id": id})

    async def get_by_slug(self, slug: str):
        return await self.db.product.find_unique(
            where={"slug": slug}, include={"variants": True, "images": True}
        )

    async def check_review_status(
        self, user_id: int, product_id: int
    ) -> tuple[bool, bool]:
        purchase_count_task = self.db.order.count(
            where={
                "user_id": user_id,
                "payment_status": PaymentStatus.SUCCESS,
                "order_items": {"some": {"variant": {"product_id": product_id}}},
            }
        )
        review_count_task = self.db.review.count(
            where={"user_id": user_id, "product_id": product_id}
        )
        purchase_count, review_count = await asyncio.gather(
            purchase_count_task, review_count_task
        )
        return purchase_count > 0, review_count > 0

    async def get_variant(self, variant_id: int):
        return await self.db.productvariant.find_unique(where={"id": variant_id})

    async def update_variant(self, variant_id: int, update_data: Any):
        return await self.db.productvariant.update(
            where={"id": variant_id}, data=update_data
        )

    def map_age_group(self, age_str: str | None) -> str | None:
        if not age_str:
            return None
        mapped = self.AGE_GROUP_MAP.get(age_str.strip())
        if not mapped:
            logger.warning(f"Unrecognized age value in feed: {age_str!r}")
        return mapped

    @cacheable(key_prefix="merchant_feed", tags=["products"])
    async def generate_merchant_feed_xml(self, request: Request, target) -> str:
        """
        Generates Google Merchant Feed.
        Optimized to process 20k+ records in batches to keep memory footprints low.
        """
        rss = ET.Element("rss", version="2.0")
        rss.set("xmlns:g", "http://base.google.com/ns/1.0")
        channel = ET.SubElement(rss, "channel")
        ET.SubElement(channel, "title").text = "Revoque Product Feed"
        ET.SubElement(channel, "link").text = settings.FRONTEND_HOST
        ET.SubElement(
            channel, "description"
        ).text = "Automated product sync feed for Google Merchant Center"

        batch_size = 1000
        skip = 0

        availability_map = {
            "google": {"in": "in_stock", "out": "out_of_stock"},
            "meta": {"in": "in stock", "out": "out of stock"},
        }

        while True:
            products = await self.db.product.find_many(
                where={"active": True},
                include={"variants": True, "images": True, "categories": True},
                order={"created_at": "desc"},
                take=batch_size,
                skip=skip,
            )
            if not products:
                break

            for prod in products:
                for variant in prod.variants:
                    item = ET.SubElement(channel, "item")
                    ET.SubElement(item, "g:id").text = variant.sku

                    variant_title = prod.name or ""

                    detail_parts = []
                    if variant.size:
                        detail_parts.append(f"Size:{variant.size}")
                    if variant.width:
                        detail_parts.append(f"W:{variant.width}cm")
                    if variant.length:
                        detail_parts.append(f"L:{variant.length}cm")
                    if variant.age:
                        detail_parts.append(f"Age:{variant.age}")
                    if detail_parts:
                        variant_title += f" ({', '.join(detail_parts)})"

                    ET.SubElement(item, "g:title").text = variant_title.strip()
                    ET.SubElement(item, "g:description").text = (
                        prod.description or "No description available."
                    )

                    ET.SubElement(
                        item, "g:link"
                    ).text = f"{settings.FRONTEND_HOST}/products/{prod.slug}"

                    main_image = prod.image or (
                        prod.images[0].image
                        if prod.images
                        else f"{settings.FRONTEND_HOST}/placeholder.jpg"
                    )
                    ET.SubElement(item, "g:image_link").text = main_image
                    ET.SubElement(item, "g:availability").text = (
                        availability_map[target]["in"]
                        if variant.inventory > 0
                        else availability_map[target]["out"]
                    )
                    ET.SubElement(item, "g:condition").text = (
                        "new" if prod.is_new else "used"
                    )
                    if variant.old_price and variant.old_price > variant.price:
                        ET.SubElement(
                            item, "g:price"
                        ).text = f"{variant.old_price:.2f} NGN"
                        ET.SubElement(
                            item, "g:sale_price"
                        ).text = f"{variant.price:.2f} NGN"
                    else:
                        ET.SubElement(item, "g:price").text = f"{variant.price:.2f} NGN"

                    if variant.size:
                        ET.SubElement(item, "g:size").text = variant.size
                    if variant.color:
                        ET.SubElement(item, "g:color").text = variant.color

                    if variant.age:
                        mapped_age = self.map_age_group(variant.age)
                        if mapped_age:
                            ET.SubElement(item, "g:age_group").text = mapped_age

                    if prod.categories:
                        ET.SubElement(item, "g:product_type").text = ", ".join(
                            c.name for c in prod.categories
                        )
                    ET.SubElement(item, "g:identifier_exists").text = "no"

            skip += batch_size
            await asyncio.sleep(
                0.01
            )  # Yield loop to allow other network requests to process

        xml_str = ET.tostring(rss, encoding="utf-8", method="xml").decode("utf-8")
        return f'<?xml version="1.0" encoding="utf-8"?>\n{xml_str}'

    async def get_similar_products(self, product_id: int, limit: int) -> list:
        key: str = f"product:{product_id}:similar"
        ids = await self.cache_srv.redis.lrange(key, 0, -1)
        if not ids:
            return []

        ids = ids[:limit]

        documents = self.search_engine.get_documents_by_filter(
            f"id IN [{','.join(ids)}]", limit
        )

        documents = [dict(doc) for doc in documents]

        # re-sort here using the Redis order (which IS the similarity ranking)
        order_map = {int(pid): idx for idx, pid in enumerate(ids)}
        documents.sort(key=lambda doc: order_map.get(doc["id"], len(ids)))

        return documents

    async def get_personalized_recommendations(self, user_id: int, limit: int) -> list:
        product_ids = await self.cache_srv.redis.lrange(f"user:{user_id}:history", 0, 4)
        if not product_ids:
            return []

        recommendation_scores = Counter()
        seen = set(product_ids)

        for pid in product_ids:
            similar_ids = await self.cache_srv.redis.lrange(
                f"product:{pid}:similar", 0, -1
            )
            for sid in similar_ids:
                if sid not in seen:
                    recommendation_scores[sid] += 1

        if not recommendation_scores:
            return []

        top_ids = [pid for pid, _ in recommendation_scores.most_common(10)]
        filter_str = " OR ".join([f"id = {pid}" for pid in top_ids])

        results = await self.search_engine.search_index(
            "",
            {
                "filter": filter_str,
                "limit": limit,
                "attributesToRetrieve": PRODUCT_ATTRIBUTES,
            },
        )
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

        search_params: Dict[str, Any] = {
            "limit": limit,
            "offset": offset,
            "attributesToRetrieve": PRODUCT_ATTRIBUTES,
        }
        if base_filters:
            search_params["filter"] = " AND ".join(base_filters)

        search_params["sort"] = (
            [sort or "id:desc"] if disable_random_feed else ["random_score:asc"]
        )

        try:
            res = await self.search_engine.search_index(
                search if disable_random_feed else "", search_params
            )
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
                "filter": f'active = true AND collections.slug = "{col}"',
                "attributesToRetrieve": PRODUCT_ATTRIBUTES,
            }
            res = await self.search_engine.search_index("", search_params)

            key_name: str = "arrival" if col == "new-arrivals" else col
            return key_name, res.get("hits", [])

        tasks = [fetch_collection(col) for col in collections]
        completed_tasks = await asyncio.gather(*tasks)

        return dict(completed_tasks)

    def _has_active_filters(self, kw) -> bool:
        return any(
            [
                kw.get("search"),
                kw.get("cat_ids"),
                kw.get("collections"),
                kw.get("sizes"),
                kw.get("ages"),
                kw.get("width"),
                kw.get("length"),
                kw.get("sort"),
                kw.get("min_price", 1) != 1,
                kw.get("max_price", 50000) != 50000,
            ]
        )

    def _build_search_filters_list(self, kw) -> list[str]:
        filters = []
        if kw.get("cat_ids"):
            filters.append(f"categories.slug IN {url_to_list(kw['cat_ids'])}")
        if kw.get("collections"):
            filters.append(f"collections.slug IN [{kw['collections']}]")
        if kw.get("min_price") is not None:
            filters.append(f"min_price >= {kw['min_price']}")
        if kw.get("max_price") is not None:
            filters.append(f"max_price <= {kw['max_price']}")
        filters.append(f"active = {str(kw.get('active', True)).lower()}")
        if kw.get("sizes"):
            filters.append(f"sizes IN [{kw['sizes']}]")
        if kw.get("ages"):
            filters.append(f"ages IN {url_to_list(kw['ages'])}")
        if kw.get("width"):
            filters.append(f"widths IN [{kw['width']}]")
        if kw.get("length"):
            filters.append(f"lengths IN [{kw['length']}]")
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

    async def get_for_search_many(
        self,
        product_ids: Sequence[int],
    ):
        if not product_ids:
            return []

        return await self.db.product.find_many(
            where={
                "id": {
                    "in": list(product_ids),
                },
            },
            include={
                "categories": True,
                "collections": True,
                "images": True,
                "variants": True,
                "shared_collections": True,
            },
        )

    async def iter_for_search(
        self,
        batch_size: int = 500,
    ) -> AsyncIterator[list]:
        offset = 0

        while True:
            products = await self.db.product.find_many(
                skip=offset,
                take=batch_size,
                order={"id": "asc"},
                include={
                    "categories": True,
                    "collections": True,
                    "images": True,
                    "variants": True,
                    "shared_collections": True,
                },
            )

            if not products:
                break

            yield products

            offset += len(products)

            if len(products) < batch_size:
                break

    def product_to_search_document(self, product: Product) -> dict:
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

        product_dict["categories"] = (
            [
                {
                    "id": category.id,
                    "name": category.name,
                    "slug": category.slug,
                }
                for category in product.categories or  []
            ],
        )

        product_dict["collections"] = (
            [
                {
                    "id": collection.id,
                    "name": collection.name,
                    "slug": collection.slug,
                }
                for collection in product.collections or []
            ],
        )

        images = [
            img.image
            for img in sorted((product.images or []), key=lambda img: img.order)
        ]
        product_dict["image"] = images[0] if images else None
        product_dict["images"] = images if images else []

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
            if v.get("size"):
                sizes.append(v["size"])
            if v.get("color"):
                colors.append(v["color"])
            if v.get("age"):
                ages.append(v["age"])
            if v.get("width"):
                widths.append(v["width"])
            if v.get("length"):
                lengths.append(v["length"])

        product_dict["sizes"] = sizes
        product_dict["colors"] = colors
        product_dict["ages"] = ages
        product_dict["widths"] = widths
        product_dict["lengths"] = lengths

        variant_prices = [v["price"] for v in variants if v.get("price") is not None]
        product_dict["min_price"] = min(variant_prices) if variant_prices else 0
        product_dict["max_price"] = max(variant_prices) if variant_prices else 0

        product_dict["in_stock"] = any(v["inventory"] > 0 for v in variants)

        return product_dict

    async def delete_product_index(self, product_ids: List[int]) -> None:
        try:
            if len(product_ids) == 0:
                return
            await self.search_engine.delete(document_ids=product_ids)
            keys: list[str] = [f"product:{id}" for id in product_ids]
            await self.cache_srv.invalidate(
                tags=["products", "catalog", "stats-trends", "gallery"] + keys
            )
        except Exception as e:
            logger.error(f"Error deleting products {product_ids} from index: {e}")

    async def index_product(self, product_id: int):
        await self.index_products([product_id])

    async def index_products(self, product_ids: list[int]):
        if not product_ids:
            return
        try:
            products = await self.get_for_search_many(product_ids)

            if not products:
                return

            documents = [
                self.product_to_search_document(product) for product in products
            ]

            await self.search_engine.index(documents)

            cloudfare_paths = [f"/api/product/{p.slug}" for p in products]
            slug_tags = [f"product:{p.slug}" for p in products]

            await self.cdn_srv.purge_cloudfare(*cloudfare_paths)
            await self.cache_srv.invalidate(
                *slug_tags, tags=["products", "catalog", "gallery"]
            )
        except Exception as e:
            logger.error(str(e))

    async def index_all_products(self):
        cloudfare_paths = []
        slug_tags = []
        try:
            async for products in self.iter_for_search(
                batch_size=500,
            ):
                documents = [
                    self.product_to_search_document(product)
                    for product in products
                ]
                cloudfare_paths.extend([f"/api/product/{p.slug}" for p in products])
                slug_tags.extend([f"product:{p.slug}" for p in products])

                await self.search_engine.index(documents)
            await self.cdn_srv.purge_cloudfare(*cloudfare_paths)
            await self.cache_srv.invalidate(
                *slug_tags, tags=["products", "catalog", "gallery"]
            )
        except Exception as e:
            logger.error(str(e))

    async def delete_product(
        self,
        product_id: int,
    ):
        await self.search_engine.delete([product_id])

    async def delete_products(self, product_ids: list[int]):
        if not product_ids:
            return

        await self.search_engine.delete(product_ids)
