from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

def create_engine(database_url: str) -> AsyncEngine:
    if database_url.startswith("postgres://"):
        database_url = database_url.replace(
            "postgres://",
            "postgresql+asyncpg://",
            1,
        )
    elif database_url.startswith("postgresql://"):
        database_url = database_url.replace(
            "postgresql://",
            "postgresql+asyncpg://",
            1,
        )

    return create_async_engine(
        database_url,
        pool_pre_ping=True,
    )