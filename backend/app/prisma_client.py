from typing import Annotated, AsyncGenerator
from fastapi import Depends
from prisma import Prisma

prisma = Prisma(auto_register=True)

async def get_db() -> AsyncGenerator[Prisma, None]:
    """Dependency provider for route operations."""
    yield prisma

DbDep = Annotated[Prisma, Depends(get_db)]
