from arq.connections import ArqRedis
from app.core.config import settings

redis_client = ArqRedis.from_url(
    settings.REDIS_URL,
    decode_responses=True,
    max_connections=10,
)
