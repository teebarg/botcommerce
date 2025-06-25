import os
from celery import Celery

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "worker",
    broker=redis_url,
    backend=redis_url,
    include=["worker"]
)

# Optional: Configure task routes
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

# celery_app = Celery(
#     "session_tasks",
#     broker=os.getenv("REDIS_URL"),
#     backend=os.getenv("REDIS_URL"),
# )
# celery_app.conf.timezone = "UTC"
