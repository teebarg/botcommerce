from app.prisma_client import prisma as db
from app.core.config import settings
from app.core.logging import logger
from app.services.meilisearch import add_documents_to_index, update_document
from app.models.product import Product
from app.services.run_sheet import process_products, generate_excel_file
from app.services.prisma import with_prisma_connection
from app.services.websocket import manager
from app.services.activity import log_activity
from app.services.redis import CacheService

@with_prisma_connection
async def reindex_product(cache: CacheService, product_id: int):
    try:
        product = await db.product.find_unique(
            where={"id": product_id},
            include={
                "variants": True,
                "categories": True,
                "brand": True,
                "tags": True,
                "images": True,
                "collections": True,
                "reviews": True,
            }
        )

        if not product:
            logger.warning(
                f"Product with id {product_id} not found for re-indexing.")
            return

        product_data = prepare_product_data_for_indexing(product)

        await update_document(index_name=settings.MEILI_PRODUCTS_INDEX, document=product_data)

        logger.info(f"Successfully reindexed product {product_id}")
        await cache.invalidate_list_cache("products")
        await cache.bust_tag(f"product:{product.slug}")
        await manager.broadcast_to_all(
            data={
                "message": "Product re-indexed successfully",
                "status": "completed",
            },
            message_type="product-index",
        )

    except Exception as e:
        logger.error(f"Error re-indexing product {product_id}: {e}")

@with_prisma_connection
async def index_products(cache: CacheService):
    """
    Re-index all products in the database to Meilisearch.
    """
    try:
        logger.info("Starting re-indexing..........")
        products = await db.product.find_many(
            include={
                "variants": True,
                "categories": True,
                "collections": True,
                "brand": True,
                "images": True,
                "reviews": True,
            }
        )

        documents = []
        for product in products:
            product_dict = prepare_product_data_for_indexing(product)
            documents.append(product_dict)

        add_documents_to_index(
            index_name=settings.MEILI_PRODUCTS_INDEX, documents=documents)

        logger.info(f"Reindexed {len(documents)} products successfully.")
        await cache.invalidate_list_cache("products")
        await cache.invalidate_list_cache("product")
        await manager.broadcast_to_all(
            data={
                "message": "Products re-indexed successfully",
                "status": "completed",
            },
            message_type="product-index",
        )
    except Exception as e:
        logger.error(f"Error during product re-indexing: {e}")


@with_prisma_connection
async def product_upload(cache: CacheService, user_id: str, contents: bytes, content_type: str, filename: str):
    logger.info("Starting product upload processing...")
    try:
        num_rows = await process_products(file_content=contents, content_type=content_type, user_id=user_id)

        await index_products(cache=cache)
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
            description=f"Uploaded products from file: {filename}",
            is_success=True
        )
    except Exception as e:
        logger.error(f"Error processing data from file: {e}")
        await log_activity(
            user_id=user_id,
            activity_type="PRODUCT_UPLOAD",
            description=f"Failed to upload products from file: {filename}",
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


def prepare_product_data_for_indexing(product: Product) -> dict:
    product_dict = product.dict()

    product_dict["collections"] = [c.name for c in product.collections]
    if product.brand:
        product_dict["brand"] = product.brand.name
    product_dict["categories"] = [c.name for c in product.categories]
    product_dict["images"] = [img.image for img in sorted(
        product.images, key=lambda img: img.order)]

    variants = [v.dict() for v in product.variants]
    product_dict["variants"] = variants

    variant_prices = [v["price"]
                      for v in variants if v.get("price") is not None]
    product_dict["variant_prices"] = variant_prices
    product_dict["min_variant_price"] = min(
        variant_prices) if variant_prices else 0
    product_dict["max_variant_price"] = max(
        variant_prices) if variant_prices else 0

    reviews = [r.dict() for r in product.reviews]
    product_dict["reviews"] = reviews

    ratings = [r["rating"] for r in reviews if r.get("rating") is not None]
    product_dict["review_count"] = len(ratings)
    product_dict["average_rating"] = round(
        sum(ratings) / len(ratings), 2) if ratings else 0

    if any(v["inventory"] > 0 for v in variants):
        product_dict["status"] = "IN STOCK"
    else:
        product_dict["status"] = "OUT OF STOCK"

    return product_dict
