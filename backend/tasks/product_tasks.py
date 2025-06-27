from celery_app import celery_app
from app.services.redis_websocket import manager
from app.services.activity import log_activity
from app.services.product import index_products, product_upload
import asyncio
from app.core.huey_instance import huey

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

@celery_app.task
def upload_product_file(user_id: str, contents: bytes, content_type: str, filename: str):
    async def _run():
        try:
            logging.info("Starting product upload processing...")
            num_rows = await process_products(file_content=contents, content_type=content_type, user_id=user_id)

            await index_products()

            await manager.send_to_user(
                user_id=str(user_id),
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
                is_success=True,
            )

        except Exception as e:
            logging.error(f"Error processing data from file: {e}")
            await log_activity(
                user_id=user_id,
                activity_type="PRODUCT_UPLOAD",
                description=f"Failed to upload products from file: {filename}",
                is_success=False,
            )

    asyncio.run(_run())
