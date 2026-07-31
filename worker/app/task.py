import asyncio
from arq import cron
from arq.connections import RedisSettings
from app.tasks import all_ecommerce_tasks
from app.config import settings
from app.tasks.enrich_products import enrich_products
from app.tasks.products import clean_up_dangling
from app.db import db
from app.logger import logger

async def startup(ctx):
    """Runs exactly once when the worker container fires up"""
    if not settings.WORKER_ENABLED:
        logger.info("🚨 [SUSPENDED] WORKER_ENABLED is set to False. Suspending background system...")
        # Keep the container alive so Render's health checks don't crash loop,
        while True:
            await asyncio.sleep(3600)

    await db.connect()

    ctx['db_pool'] = db.get_pool()

async def shutdown(ctx):
    """Runs exactly once when the worker gracefully shuts down"""
    print("🛑 Disconnecting Worker Database Pool...")
    await db.disconnect()

class WorkerSettings:
    functions = [*all_ecommerce_tasks]

    on_startup = startup
    on_shutdown = shutdown

    cron_jobs = [
        cron(
            'app.task.enrich_products',
            hour={0, 6, 12, 18},             # Targets execution blocks 6 hours apart
            minute=0,                        # Locks it to the top of the hour to prevent continuous looping
            run_at_startup=True,
            keep_result=0
        ),
        cron(
            clean_up_dangling,
            hour=3, minute=0,       # daily at 03:00 server time
            name="nightly_dangling_product_cleanup",
            keep_result=0
        ),
    ] if settings.CRON_JOBS_ENABLED else []

    redis_settings = RedisSettings.from_dsn(settings.BROKER_URL)
    max_jobs = 10
    job_timeout = 3000
    max_tries = 3
