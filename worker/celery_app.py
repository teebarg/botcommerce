from celery import Celery
from app.config import settings

celery_app = Celery(
    "worker",
    broker=settings.BROKER_URL,
    backend=settings.BROKER_URL,
)

celery_app.conf.task_routes = {
    "tasks.enrich_products.*": {"queue": "enrichment"},
}

celery_app.conf.update(task_serializer="json", result_serializer="json")
