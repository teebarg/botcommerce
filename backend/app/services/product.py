from app.prisma_client import prisma as db
from app.core.config import settings
from app.core.logging import logger
from app.services.meilisearch import add_documents_to_index
from app.models.product import Product
from app.services.run_sheet import process_products

from app.services.redis_websocket import manager
from app.services.activity import log_activity

async def index_products():
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
    except Exception as e:
        logger.error(f"Error during product re-indexing: {e}")


async def product_upload(user_id: str, contents: bytes, content_type: str, filename: str):
    # delay by 30sec
    await asyncio.sleep(30)


async def product_upload1(user_id: str, contents: bytes, content_type: str, filename: str):
    logger.info("Starting product upload processing...")
    try:
        num_rows = await process_products(file_content=contents, content_type=content_type, user_id=user_id)

        # Re-index
        await index_products()
        logger.info("Re-indexing completed.")
        logger.info("Broadcasting message to user...")
        await manager.send_to_user(
            user_id=user_id,
            data={
                "status": "completed",
                "total_rows": num_rows,
                "processed_rows": num_rows,
            },
            message_type="sheet-processor",
        )

        # Log the activity
        await log_activity(
            user_id=user_id,
            activity_type="PRODUCT_UPLOAD",
            description=f"Uploaded products from file: {filename}",
            is_success=True
        )
    except Exception as e:
        logger.error(f"Error processing data from file: {e}")
        # Log failed activity
        await log_activity(
            user_id=user_id,
            activity_type="PRODUCT_UPLOAD",
            description=f"Failed to upload products from file: {filename}",
            is_success=False
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

    # Reviews
    reviews = [r.dict() for r in product.reviews]
    product_dict["reviews"] = reviews

    ratings = [r["rating"] for r in reviews if r.get("rating") is not None]
    product_dict["review_count"] = len(ratings)
    product_dict["average_rating"] = round(
        sum(ratings) / len(ratings), 2) if ratings else 0

    return product_dict
