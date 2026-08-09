import asyncpg
from core.db.engine import create_engine
from core.db.session import create_session_factory
from app.config import settings

class Database:
    def __init__(self):
        self.pool: asyncpg.Pool | None = None

    async def connect(self):
        if self.pool is None:
            self.pool = await asyncpg.create_pool(
                dsn=settings.DATABASE_URL,
                min_size=1,
                max_size=3,
            )

    async def disconnect(self):
        if self.pool:
            await self.pool.close()
            self.pool = None

    def get_pool(self) -> asyncpg.Pool:
        if self.pool is None:
            raise RuntimeError("Database not initialized.")
        return self.pool

db = Database()

engine = create_engine(settings.DATABASE_URL)
session_factory = create_session_factory(engine)
