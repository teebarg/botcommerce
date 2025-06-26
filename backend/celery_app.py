from celery import Celery
from app.core.config import settings
import ssl

redis_url = settings.REDIS_URL

celery_app = Celery(
    "worker",
    broker=redis_url,
    backend=redis_url,
    include=["tasks.sync_tasks", "tasks.product_tasks"]
)

# celery_app.autodiscover_tasks(["tasks"])

# Shared SSL config for broker and backend
ssl_config = {
    "ssl_cert_reqs": ssl.CERT_NONE,
}

# For SSL-based Redis like Upstash, pass ssl dict, not boolean
celery_app.conf.update(
    worker_redirect_stdouts=False,
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    broker_use_ssl={"ssl_cert_reqs": "none"},
    redis_backend_use_ssl=ssl_config,
)

# celery_app.conf.update(
#     worker_redirect_stdouts=False,  # This should fix the LoggingProxy error
#     worker_hijack_root_logger=False,
#     worker_log_color=False,
#     # Your other Celery settings...
# )
