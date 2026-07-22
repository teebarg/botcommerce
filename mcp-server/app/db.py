import asyncpg
from app.config import settings

pool: asyncpg.Pool | None = None

async def init_db():
    global pool
    db_url: str = settings.DATABASE_URL
    pool = await asyncpg.create_pool(dsn=db_url, min_size=5, max_size=20)

async def close_db():
    global pool
    if pool:
        await pool.close()

def get_pool() -> asyncpg.Pool:
    if pool is None:
        raise RuntimeError("Database pool is not initialized.")
    return pool