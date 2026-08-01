import asyncio
import asyncpg
from app.config import settings
from app.tasks.cloudinary_reconcile import _get_all_referenced_public_ids

async def main():
    pool = await asyncpg.create_pool(settings.DATABASE_URL, min_size=1, max_size=1)
    refs = await _get_all_referenced_public_ids(pool)
    print("fgumvmgcdwih0xewbgix" in refs)
    await pool.close()

asyncio.run(main())
