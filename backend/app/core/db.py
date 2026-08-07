from typing import Annotated, AsyncGenerator
from fastapi import Depends
from prisma import Prisma
from app.prisma_client import prisma

async def get_db() -> AsyncGenerator[Prisma, None]:
    """Dependency provider for route operations."""
    yield prisma

DbDep = Annotated[Prisma, Depends(get_db)]