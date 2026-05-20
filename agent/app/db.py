from app.logging import get_logger
import asyncpg
from app.config import settings

logger = get_logger(__name__)

async def get_connection() -> asyncpg.Connection:
    url: str | None = settings.DATABASE_URL
    if not url:
        raise RuntimeError("DATABASE_URL is not set in .env")

    return await asyncpg.connect(url)
