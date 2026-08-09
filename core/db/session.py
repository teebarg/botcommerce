from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker


def create_session_factory(engine):
    return async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )