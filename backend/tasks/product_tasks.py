from celery_app import celery_app
from app.api.routes.websocket import manager
from app.services.activity import log_activity
from app.services.product import index_products

import logging

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s - %(name)s - %(message)s"
)

@celery_app.task()
def index_products_task():
    logging.info("Starting product indexing task...")
    index_products()
    logging.info("Product indexing task completed.")


@celery_app.task
def upload_product_file(user_id: str, contents: bytes, content_type: str, filename: str):
    import asyncio

    async def _run():
        try:
            logging.info("Starting product upload processing...")
            num_rows = await process_products(file_content=contents, content_type=content_type, user_id=user_id)

            await index_products()

            await manager.broadcast(
                id=str(user_id),
                data={
                    "status": "completed",
                    "total_rows": num_rows,
                    "processed_rows": num_rows,
                },
                type="sheet-processor",
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
