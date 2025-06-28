from app.services.product import index_products, product_upload
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
def product_upload_task(user_id: str, contents: bytes, content_type: str, filename: str):
    logging.info("Starting product upload processing...")
    asyncio.run(product_upload(user_id=user_id, contents=contents, content_type=content_type, filename=filename))
    logging.info("Product upload processing completed.")
