from typing import Annotated

from prisma import Prisma
from contextlib import asynccontextmanager
from fastapi import Depends
from app.core.logging import logger

# Initialize Prisma client
prisma = Prisma()


# Context manager for database connections
@asynccontextmanager
async def get_db():
    # await prisma.connect()
    try:
        await prisma.connect()
        yield prisma
    except Exception as e:
        logger.error(f"Database connection error: {e}")
    finally:
        await prisma.disconnect()


# Dependency for database connection
async def get_prisma():
    async with get_db() as db:
        yield db


PrismaDb = Annotated[Prisma, Depends(get_prisma)]
