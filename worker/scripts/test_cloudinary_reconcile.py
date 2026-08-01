"""
Manual test runner for find_orphaned_cloudinary_assets.

Usage:
    uv run python scripts/test_cloudinary_reconcile.py            # dry run (default, safe)
    uv run python scripts/test_cloudinary_reconcile.py --live     # actually deletes orphans
"""

import argparse
import asyncio
import json
import logging

import asyncpg
import cloudinary

from app.config import settings
from app.tasks.cloudinary_reconcile import find_orphaned_cloudinary_assets  # adjust import path

logging.basicConfig(level=logging.INFO)


def configure_cloudinary():
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


async def main(live: bool):
    configure_cloudinary()

    pool = await asyncpg.create_pool(settings.DATABASE_URL, min_size=1, max_size=3)
    try:
        ctx = {"db_pool": pool}
        result = await find_orphaned_cloudinary_assets(ctx, dry_run=not live)

        print(json.dumps(result, indent=2))

        if not live and result["orphan_count"] > 0:
            print(
                f"\n{result['orphan_count']} orphan(s) found "
                f"({result['orphan_size_mb']} MB). "
                f"Spot-check a few public_ids above in the Cloudinary media "
                f"library, then re-run with --live to actually delete them."
            )
    finally:
        await pool.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--live",
        action="store_true",
        help="Actually delete orphaned assets from Cloudinary (default: dry run only)",
    )
    args = parser.parse_args()

    if args.live:
        confirm = input(
            "This will PERMANENTLY DELETE orphaned assets from Cloudinary. "
            "Type 'yes' to continue: "
        )
        if confirm.strip().lower() != "yes":
            print("Aborted.")
            raise SystemExit(0)

    asyncio.run(main(live=args.live))