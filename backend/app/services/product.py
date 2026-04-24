import asyncio
from typing import List, Optional, Any
from app.prisma_client import prisma as db
from app.core.config import settings
from app.core.logging import get_logger
from app.services.meilisearch import update_document, delete_document, add_documents_to_index, clear_index
from app.models.product import Product
from app.services.prisma import with_prisma_connection
from app.services.redis import refresh_data, invalidate_key_only
import random
from datetime import datetime, timezone
from app.services.websocket import manager

logger = get_logger(__name__)


@with_prisma_connection
async def delete_product_index(product_ids: List[int]) -> None:
    try:
        await asyncio.gather(*[
            delete_document(index_name=settings.MEILI_PRODUCTS_INDEX, document_id=str(pid))
            for pid in product_ids
        ])
        await asyncio.gather(*[
            invalidate_key_only(f"product:similar:{pid}")
            for pid in product_ids
        ])
        await invalidate_product_cache()
    except Exception as e:
        logger.error(f"Error deleting products {product_ids} from index: {e}")


@with_prisma_connection
async def index_product(product_id: int):
    try:
        product = await db.product.find_unique(
            where={"id": product_id},
            include={
                "categories": True,
                "collections": True,
                "variants": True,
                "images": True,
                "shared_collections": True,
            }
        )

        if not product:
            logger.warning(
                f"product with id {product_id} not found for re-indexing.")
            return

        try:
            product_data = prepare_product_data_for_indexing(product)
            await update_document(index_name=settings.MEILI_PRODUCTS_INDEX, document=product_data)
            await invalidate_product_cache(keys=[
                f"product:slug:{product.slug}",
                f"product:similar:{product.id}",
            ])
        except Exception as e:
            logger.debug(f"Error re-indexing product {product_id}: {e}")

    except Exception as e:
        logger.error(f"Error re-indexing product {product_id}: {e}")

@with_prisma_connection
async def index_products(product_ids: Optional[List[int]] = None):
    try:
        logger.info("Starting re-indexing..........")
        products = await db.product.find_many(
            where={"id": {"in": product_ids}} if product_ids else None,
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

        if product_ids is None or len(product_ids) < 1:
            logger.info("Clearing index...")
            await clear_index(index_name=settings.MEILI_PRODUCTS_INDEX)

        documents = []
        cache_keys: list[str] = []
        for product in products:
            try:
                product_data = prepare_product_data_for_indexing(product)
                documents.append(product_data)
                if product.slug:
                    cache_keys.append(f"product:slug:{product.slug}")
                if product.id:
                    cache_keys.append(f"product:similar:{product.id}")
            except Exception as e:
                logger.debug(f"Error preparing product {product.id}: {e}")

        BATCH_SIZE = 500
        for i in range(0, len(documents), BATCH_SIZE):
            batch = documents[i:i + BATCH_SIZE]
            await add_documents_to_index(index_name=settings.MEILI_PRODUCTS_INDEX, documents=batch)
            logger.info(f"Indexed batch {i // BATCH_SIZE + 1} ({len(batch)} products)")

        await invalidate_product_cache(keys=cache_keys)
        logger.info(f"Successfully indexed {len(documents)} products")
    except Exception as e:
        logger.error(f"Error during product re-indexing: {e}")


def prepare_product_data_for_indexing(product: Product) -> dict:
    created_at: Any | None = getattr(product, "created_at", None)
    if created_at:
        age_hours: int = max(
            (datetime.now(timezone.utc) - created_at).total_seconds() / 3600,
            1
        )
        freshness_score: float = round(1 / age_hours, 6)
    else:
        freshness_score = 0

    product_dict: dict[str, bool | int | str | Unknown | None] = {
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

    # Images
    images = [img.image for img in sorted((product.images or []), key=lambda img: img.order)]
    product_dict["image"] = images[0] if images else None

    # Variants
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
        if v.get("size"):        sizes.append(v["size"])
        if v.get("color"):       colors.append(v["color"])
        if v.get("age"):         ages.append(v["age"])
        if v.get("width"):       widths.append(v["width"])
        if v.get("length"):      lengths.append(v["length"])

    product_dict["sizes"] = sizes
    product_dict["colors"] = colors
    product_dict["ages"] = ages
    product_dict["widths"] = widths
    product_dict["lengths"] = lengths

    # Prices
    variant_prices = [v["price"] for v in variants if v.get("price") is not None]
    product_dict["min_variant_price"] = min(variant_prices) if variant_prices else 0
    product_dict["max_variant_price"] = max(variant_prices) if variant_prices else 0

    # Stock status
    product_dict["status"] = (
        "IN STOCK" if any(v["inventory"] > 0 for v in variants) else "OUT OF STOCK"
    )
    product_dict["catalogs"] = [sc.slug for sc in (product.shared_collections or [])]

    return product_dict


async def invalidate_product_cache(keys: List[str] = None) -> None:
    await refresh_data(
        patterns=["gallery", "products:list", "products:search", "products:catalog", "products:recommendation", "products:home", "products:collection"],
        keys=keys
    )
    # await asyncio.gather(
    #     invalidate_keys("products:list"),
    #     invalidate_keys("products:search"),
    #     invalidate_keys("products:catalog"),
    #     invalidate_keys("products:recommendation"),
    #     invalidate_keys("products:home"),
    #     invalidate_keys("products:collection"),
    # )
    # await manager.broadcast_to_all(data={"key": "products"}, message_type="invalidate")
    # if keys:
    #     for key in keys:
    #         await invalidate_key_only(key)
    #     await manager.broadcast_to_all(
    #         data={"keys": keys},
    #         message_type="invalidate",
    #     )
    #     return
