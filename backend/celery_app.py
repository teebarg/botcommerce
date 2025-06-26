from celery import Celery
from app.core.config import settings

redis_url = settings.REDIS_URL

celery_app = Celery(
    "worker",
    broker=redis_url,
    backend=redis_url,
    include=["tasks.sync_tasks", "tasks.product_tasks"]
)

celery_app.conf.update(
    worker_redirect_stdouts=False,
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)
