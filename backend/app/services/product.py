from typing import Union, List
from app.prisma_client import prisma as db
from app.core.config import settings
from app.core.logging import get_logger
from app.services.meilisearch import add_documents_to_index, update_document, clear_index, delete_document
from app.models.product import Product, ProductImage
from app.services.run_sheet import process_products, generate_excel_file
from app.services.prisma import with_prisma_connection
from app.services.websocket import manager
from app.services.activity import log_activity
from app.services.redis import invalidate_pattern, invalidate_key

logger = get_logger(__name__)


@with_prisma_connection
async def delete_image_index(images: Union[ProductImage, List[ProductImage]]):
    has_product = False
    if isinstance(images, ProductImage):
        images = [images]  # normalize to list
    try:
        for image in images:
            if image.product is not None:
                has_product = True
                await delete_document(index_name=settings.MEILI_PRODUCTS_INDEX, document_id=str(image.product.id))
                await invalidate_key(f"product:{image.product.slug}")
    except Exception as e:
        logger.debug(f"Error re-indexing image {image.id}: {e}")

    if has_product:
        await invalidate_pattern("products")


@with_prisma_connection
async def reindex_catalog(product_id: int):
    try:
        await invalidate_pattern(f"gallery")
        product = await db.product.find_unique(
            where={"id": product_id},
            include={"images": True}
        )

        if not product:
            logger.warning(f"Product with id {product_id} not found for re-indexing.")
            return

        await reindex_image(image_ids=[image.id for image in product.images])
        await invalidate_pattern("product:catalog")
        await invalidate_pattern("catalog")
    except Exception as e:
        logger.error(f"Error re-indexing reindex_catalog {product_id}: {e}")


@with_prisma_connection
async def reindex_catalogs(product_ids: list[int]):
    try:
        products = await db.product.find_many(
            where={"id": {"in": product_ids}},
            include={
                "images": True,
            }
        )

        if not products:
            logger.warning(f"Products with ids {product_ids} not found for re-indexing.")
            return

        image_ids = list(set([image.id for product in products for image in product.images]))

        await reindex_image(image_ids=image_ids)
        await invalidate_pattern("product:catalog")
        await invalidate_pattern("catalog")

    except Exception as e:
        logger.error(f"Error re-indexing products {product_ids}: {e}")


@with_prisma_connection
async def reindex_product(product_id: int):
    try:
        product = await db.product.find_unique(
            where={"id": product_id},
            include={"images": True}
        )

        if not product:
            logger.warning(
                f"Product with id {product_id} not found for re-indexing.")
            return

        try:
            await reindex_image(image_ids=[image.id for image in product.images])
            logger.info(f"Successfully reindexed product {product_id}")
        except Exception as e:
            logger.debug(f"Error re-indexing product {product_id}: {e}")

    except Exception as e:
        logger.error(f"Error re-indexing product {product_id}: {e}")


@with_prisma_connection
async def index_products():
    """
    Re-index all products in the database to Meilisearch.
    """
    try:
        logger.info("Starting re-indexing..........")
        products = await db.product.find_many(
            include={"images": True}
        )

        image_ids = list(set([image.id for product in products for image in product.images]))

        try:
            await reindex_image(image_ids=image_ids)
            logger.info(f"Successfully reindexed products images")
        except Exception as e:
            logger.debug(f"Error re-indexing products images: {e}")
    except Exception as e:
        logger.error(f"Error during product re-indexing: {e}")


@with_prisma_connection
async def product_upload(user_id: str):
    logger.info("Starting product upload processing...")
    try:
        num_rows = await process_products(user_id=user_id)

        await index_products()
        logger.info("Re-indexing completed.")
        await manager.send_to_user(
            user_id=user_id,
            data={
                "status": "completed",
                "total_rows": num_rows,
                "processed_rows": num_rows,
            },
            message_type="sheet-processor",
        )

        await log_activity(
            user_id=user_id,
            activity_type="PRODUCT_UPLOAD",
            description=f"Uploaded products from google sheet",
            is_success=True
        )
    except Exception as e:
        logger.error(f"Error processing data from file: {e}")
        await log_activity(
            user_id=user_id,
            activity_type="PRODUCT_UPLOAD",
            description=f"Failed to upload products from google sheet",
            is_success=False
        )


@with_prisma_connection
async def product_export(email: str, user_id: str):
    download_url = await generate_excel_file(email=email)

    await log_activity(
        user_id=user_id,
        activity_type="PRODUCT_EXPORT",
        description="Exported products to Excel",
        action_download_url=download_url
    )


@with_prisma_connection
async def index_images():
    """
    Re-index all products in the database to Meilisearch.
    """
    try:
        logger.info("Starting re-indexing..........")
        images = await db.productimage.find_many(
            where={"order": 0, "product_id": {"not": None}},
            order={"id": "desc"},
            include={
                "product": {
                    "include": {
                        "categories": True,
                        "collections": True,
                        "variants": True,
                        "shared_collections": True,
                        "images": True,
                    }
                }
            },
        )

        documents = []
        for image in images:
            if image.product:
                product_dict = prepare_product_data_for_indexing(image.product)
                documents.append(product_dict)

        await clear_index(settings.MEILI_PRODUCTS_INDEX)
        await add_documents_to_index(index_name=settings.MEILI_PRODUCTS_INDEX, documents=documents)

        logger.info(f"Reindexed {len(documents)} products successfully.")

        await invalidate_pattern("products")
        await invalidate_pattern("product")
    except Exception as e:
        logger.error(f"Error during product re-indexing: {e}")


@with_prisma_connection
async def reindex_image(image_ids: Union[str, List[str]]):
    if isinstance(image_ids, str):
        image_ids = [image_ids]

    images = await db.productimage.find_many(
        where={"id": {"in": image_ids}},
        include={
                "product": {
                    "include": {
                        "categories": True,
                        "collections": True,
                        "variants": True,
                        "images": True,
                        "shared_collections": True,
                    }
                }
            },
    )
    for image in images:
        try:
            if image.product:
                product_data = prepare_product_data_for_indexing(image.product)
                await update_document(index_name=settings.MEILI_PRODUCTS_INDEX, document=product_data)
                await invalidate_key(f"product:{image.product.slug}")
        except Exception as e:
            logger.debug(f"Error re-indexing product image {image.id}: {e}")

    await invalidate_pattern("products")
    await invalidate_pattern("product:catalog")


def prepare_product_data_for_indexing(product: Product) -> dict:
    product_dict = {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "description": product.description,
        "sku": product.sku,
        "active": product.active,
    }

    product_dict["collection_slugs"] = [c.slug for c in (product.collections or [])]
    product_dict["collections"] = [{"id": c.id, "slug": c.slug, "name": c.name}
                                   for c in (product.collections or [])]
    product_dict["category_slugs"] = [c.slug for c in (product.categories or [])]
    product_dict["categories"] = [{"id": c.id, "slug": c.slug, "name": c.name}
                                    for c in (product.categories or [])]
    product_dict["images"] = [img.image for img in sorted((product.images or []), key=lambda img: img.order)]
    product_dict["image"] = product_dict["images"][0] if product_dict["images"] else None

    variants = [{"id": v.id, "price": v.price, "old_price": v.old_price, "inventory": v.inventory, "size": v.size, "color": v.color, "measurement": v.measurement, "status": v.status} for v in (product.variants or [])]
    product_dict["variants"] = variants

    variant_prices = [v["price"]
                      for v in variants if v.get("price") is not None]
    product_dict["variant_prices"] = variant_prices
    product_dict["min_variant_price"] = min(
        variant_prices) if variant_prices else 0
    product_dict["max_variant_price"] = max(
        variant_prices) if variant_prices else 0

    reviews = [r.dict() for r in (product.reviews or [])]

    ratings = [r["rating"] for r in reviews if r.get("rating") is not None]
    product_dict["review_count"] = len(ratings)
    product_dict["average_rating"] = round(
        sum(ratings) / len(ratings), 2) if ratings else 0

    if any(v["inventory"] > 0 for v in variants):
        product_dict["status"] = "IN STOCK"
    else:
        product_dict["status"] = "OUT OF STOCK"
    product_dict["sizes"] = [v["size"]
                             for v in variants if v.get("size") is not None]
    product_dict["colors"] = [v["color"]
                              for v in variants if v.get("color") is not None]
    product_dict["measurements"] = [v["measurement"]
                                    for v in variants if v.get("measurement") is not None]
    product_dict["catalogs"] = [sc.slug for sc in (product.shared_collections or [])]

    return product_dict


# def prepare_image_data_for_indexing(image) -> dict:
#     product = image.product
#     image_dict = {
#         "id": image.id,
#         "product_id": image.product_id,
#         "image": image.image,
#         "created_at": image.created_at,
#     }

#     if product:
#         image_dict["name"] = product.name
#         image_dict["description"] = product.description
#         image_dict["slug"] = product.slug
#         image_dict["collections"] = [{"id": c.id, "name": c.name} for c in (product.collections or [])]
#         image_dict["categories"] = [{"id": c.id, "name": c.name} for c in (product.categories or [])]
#         images = [img.image for img in sorted((product.images or []), key=lambda img: img.order)]
#         image_dict["images"] = images
#         image_dict["image"] = images[0] if images else None

#         variants = [{"id": v.id, "price": v.price, "old_price": v.old_price, "inventory": v.inventory, "size": v.size, "color": v.color, "measurement": v.measurement, "status": v.status} for v in (product.variants or [])]
#         image_dict["variants"] = variants

#         if any(v["inventory"] > 0 for v in variants):
#             image_dict["status"] = "IN_STOCK"
#         else:
#             image_dict["status"] = "OUT_OF_STOCK"
#         image_dict["active"] = product.active
#         image_dict["catalogs"] = [sc.slug for sc in (product.shared_collections or [])]

#     return image_dict
