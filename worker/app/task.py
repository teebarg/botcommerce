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
    logger.debug("🛑 Disconnecting Worker Database Pool...")
    await db.disconnect()

async def on_job_success(ctx):
    """
    Fires on after_job_end. Accepts ONLY 'ctx' as an argument.
    """
    job_id = ctx.get('job_id')
    job_result = ctx.get('job_result')
    duration = job_result.execution_duration if job_result else 0.0

    logger.info(
        f"✅ *Job Completed Successfully*\n"
        f"• *ID*: `{job_id}`\n"
        f"• *Duration*: `{duration:.2f}s`"
    )

async def on_job_failure(ctx):
    """
    Fires on on_job_error. Accepts ONLY 'ctx' as an argument.
    """
    job_id = ctx.get('job_id')
    exception = ctx.get('job_error', 'Unknown Error')

    logger.error(
        f"🚨 *Job Permanently Failed*\n"
        f"• *ID*: `{job_id}`\n"
        f"• *Error Reason*: `{str(exception)}`"
    )

class WorkerSettings:
    functions = [*all_ecommerce_tasks]

    on_startup = startup
    on_shutdown = shutdown

    after_job_end = on_job_success
    on_job_error = on_job_failure

    cron_jobs = [
        cron(
            enrich_products,
            hour={0, 3, 6, 9, 12, 15, 18, 21},  # Targets execution blocks 3 hours apart
            minute=0,
            name="enrich_products",
            run_at_startup=True,
            keep_result=0
        ),
        cron(
            clean_up_dangling,
            hour=3, minute=0,       # daily at 03:00 server time
            name="nightly_dangling_product_cleanup",
            run_at_startup=True,
            keep_result=0
        ),
    ] if settings.CRON_JOBS_ENABLED else []

    redis_settings = RedisSettings.from_dsn(settings.BROKER_URL)
    max_jobs = 10
    job_timeout = 3000
    max_tries = 5
