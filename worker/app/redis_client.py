import redis.asyncio as redis
from app.config import settings

redis_client = redis.from_url(settings.BROKER_URL, decode_responses=True, max_connections=10)
