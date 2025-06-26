import httpx
from celery_app import celery_app
from app.core.config import settings

@celery_app.task
def sync_disconnected_sessions():
    try:
        res = httpx.get(f"{settings.server_host}/api/sync-disconnected")
        print("Disconnected sessions:", res.json())
    except Exception as e:
        print("Sync error:", e)
