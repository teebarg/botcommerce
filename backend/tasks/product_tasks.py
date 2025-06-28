from app.services.product import index_products, product_upload, product_export, reindex_product
import asyncio
from huey_instance import huey

import logging

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s - %(name)s - %(message)s"
)

@huey.task(retries=3, retry_delay=10)
def index_products_task():
    logging.info("Starting product indexing task...")
    asyncio.run(index_products())
    logging.info("Product indexing task completed.")


@huey.task()
def reindex_product_task(product_id: int):
    logging.info("Starting product re-indexing task...")
    asyncio.run(reindex_product(product_id=product_id))
    logging.info("Product re-indexing task completed.")


@huey.task()
def product_upload_task(user_id: str, contents: bytes, content_type: str, filename: str):
    logging.info("Starting product upload processing...")
    asyncio.run(product_upload(user_id=user_id, contents=contents, content_type=content_type, filename=filename))
    logging.info("Product upload processing completed.")


@huey.task()
def product_export_task(email: str, user_id: str):
    logging.info("Starting product export processing...")
    asyncio.run(product_export(email=email, user_id=user_id))
    logging.info("Product export processing completed.")
