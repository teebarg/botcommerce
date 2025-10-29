from celery import Celery
from config import settings

celery_app = Celery(
    "worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery_app.conf.task_routes = {
    "tasks.enrich_products.*": {"queue": "enrichment"},
}

celery_app.conf.update(task_serializer="json", result_serializer="json")
