from app.config import settings
import asyncio
import json
import logging
import asyncpg

from app.tasks.products import clean_up_dangling  # adjust import path to wherever you put it

logging.basicConfig(level=logging.INFO)

DATABASE_URL="postgres://admin:password@localhost:5432/shop"


async def main():
    pool = await asyncpg.create_pool(settings.DATABASE_URL, min_size=1, max_size=5)
    try:
        ctx = {"db_pool": pool}
        result = await clean_up_dangling(ctx, dry_run=True)
        print(json.dumps(result, indent=2))
    finally:
        await pool.close()


if __name__ == "__main__":
    asyncio.run(main())