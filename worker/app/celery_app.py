from celery import Celery
from app.config import settings

app = Celery("ecommerce", broker=settings.BROKER_URL, backend=settings.BROKER_URL)

app.conf.update(
    broker_connection_retry_on_startup=True,
    task_acks_late=True,
    worker_max_tasks_per_child=20,
    worker_prefetch_limit=1
)
