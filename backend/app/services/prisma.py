from functools import wraps
from app.prisma_client import prisma

def with_prisma_connection(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            await prisma.connect()
            return await func(*args, **kwargs)
        finally:
            await prisma.disconnect()
    return wrapper
