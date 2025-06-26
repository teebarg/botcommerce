# from app.prisma_client import prisma as db
from app.core.config import settings
from app.core.logging import logger
from app.services.meilisearch import add_documents_to_index
from app.models.product import Product
from app.services.prisma import with_prisma_connection
from prisma import Prisma

# @with_prisma_connection
# async def index_products2():
#     """
#     Re-index all products in the database to Meilisearch.
#     """
#     try:
#         logger.info("Starting re-indexing..........")
#         # await db.connect()
#         from prisma import Prisma  # or whatever the sync client is called
#         db = Prisma(log_queries=False)
#         await db.connect()

#         products = await db.product.find_many(
#             include={
#                 "variants": True,
#                 "categories": True,
#                 "collections": True,
#                 "brand": True,
#                 "images": True,
#                 "reviews": True,
#             }
#         )

#         documents = []
#         for product in products:
#             product_dict = prepare_product_data_for_indexing(product)
#             documents.append(product_dict)

#         add_documents_to_index(index_name=settings.MEILI_PRODUCTS_INDEX, documents=documents)

#         logger.info(f"Reindexed {len(documents)} products successfully.")
#     except Exception as e:
#         logger.error(f"Error during product re-indexing: {e}")


def index_products():
    """
    Re-index all products in the database to Meilisearch.
    """
    try:
        db = Prisma()
        db.connect()

        products = db.product.find_many(
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

        add_documents_to_index(index_name=settings.MEILI_PRODUCTS_INDEX, documents=documents)

        logger.info(f"Reindexed {len(documents)} products successfully.")

        db.disconnect()

    except Exception as e:
        logger.error(f"Error during product re-indexing: {e}")
        if 'db' in locals():
            db.disconnect()




def prepare_product_data_for_indexing(product: Product) -> dict:
    product_dict = product.dict()

    product_dict["collections"] = [c.name for c in product.collections]
    if product.brand:
        product_dict["brand"] = product.brand.name
    product_dict["categories"] = [c.name for c in product.categories]
    product_dict["images"] = [img.image for img in sorted(product.images, key=lambda img: img.order)]

    variants = [v.dict() for v in product.variants]
    product_dict["variants"] = variants

    variant_prices = [v["price"] for v in variants if v.get("price") is not None]
    product_dict["variant_prices"] = variant_prices
    product_dict["min_variant_price"] = min(variant_prices) if variant_prices else 0
    product_dict["max_variant_price"] = max(variant_prices) if variant_prices else 0

    # Reviews
    reviews = [r.dict() for r in product.reviews]
    product_dict["reviews"] = reviews

    ratings = [r["rating"] for r in reviews if r.get("rating") is not None]
    product_dict["review_count"] = len(ratings)
    product_dict["average_rating"] = round(sum(ratings) / len(ratings), 2) if ratings else 0

    return product_dict