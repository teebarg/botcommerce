from arq import cron
from arq.connections import RedisSettings
from app.tasks import all_ecommerce_tasks
from app.config import settings
from app.tasks.enrich_products import enrich_products
from app.db import db

async def startup(ctx):
    """Runs exactly once when the worker container fires up"""
    print("🚀 Connecting Worker to Database Pool...")
    await db.connect()
    
    # Inject your instantiated database pool into the arq context dictionary
    ctx['db_pool'] = db.get_pool()

async def shutdown(ctx):
    """Runs exactly once when the worker gracefully shuts down"""
    print("🛑 Disconnecting Worker Database Pool...")
    await db.disconnect()

class WorkerSettings:
    # Uses the Python unpacking operator to register every single function automatically
    functions = [*all_ecommerce_tasks]

    on_startup = startup
    on_shutdown = shutdown

    cron_jobs = [
        cron(
            'app.task.enrich_products',
            hour={0, 6, 12, 18},             # Targets execution blocks 6 hours apart
            minute=0,                        # Locks it to the top of the hour to prevent continuous looping
            run_at_startup=True,             # Triggers immediately upon starting up (great for testing)
            keep_result=0  
        )
    ]
    
    redis_settings = RedisSettings.from_dsn(settings.BROKER_URL)
    max_jobs = 10
    job_timeout = 3000
