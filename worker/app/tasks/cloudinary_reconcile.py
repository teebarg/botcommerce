"""
Reconciliation job: find Cloudinary assets that no longer have ANY reference
in the database, across every table that can hold an image URL.

This is intentionally read-only / report-first. It does NOT delete anything
by default — orphaned storage is a cost problem, not an urgent one, and a
false positive here means permanently destroying a real asset (e.g. if a
column holding image URLs gets added later and this job isn't updated to
scan it). Always dry_run=True until you've eyeballed a report or two.

Folder scope: uploads are NOT organized into Cloudinary folders (flat
auto-generated public_ids, e.g. "tnmbfuqnrsd5gd7gp2bg"), so this scans the
entire account. That means IMAGE_SOURCES below must cover every table that
can hold a Cloudinary URL for ANYTHING on the site, not just products —
otherwise a non-product asset (e.g. a user avatar, a blog image, anything
else uploaded to the same Cloudinary account) will be misreported as
orphaned. Double-check the list against your schema before ever running
dry_run=False.
"""

import logging
import re
from typing import Optional

import asyncpg
import cloudinary
import cloudinary.api

logger = logging.getLogger(__name__)

CLOUDINARY_FOLDER_PREFIX: Optional[str] = None  # no folder scoping — scans whole account
PAGE_SIZE = 500

# Every DB column that can hold an image URL pointing at Cloudinary.
# Extend this list if you add more image-bearing columns later —
# forgetting one here is exactly how a false-positive delete happens.
IMAGE_SOURCES = [
    ("product_images", "image"),
    ("products", "image"),
    ("order_items", "image"),
    ("cart_items", "image"),
    ("categories", "image"),
    ("carousel_banners", "image"),
]

CLOUDINARY_URL_RE = re.compile(r"/upload/[^/]+/(.+)\.[a-zA-Z0-9]+$")


def _extract_public_id(url: str) -> Optional[str]:
    if not url or "res.cloudinary.com" not in url:
        return None
    match = CLOUDINARY_URL_RE.search(url)
    return match.group(1) if match else None


async def _get_all_referenced_public_ids(pool: asyncpg.Pool) -> set[str]:
    referenced: set[str] = set()
    async with pool.acquire() as conn:
        for table, column in IMAGE_SOURCES:
            rows = await conn.fetch(
                f"SELECT {column} AS url FROM {table} WHERE {column} IS NOT NULL"
            )
            for r in rows:
                pid = _extract_public_id(r["url"])
                if pid:
                    referenced.add(pid)
    return referenced


def _get_all_cloudinary_public_ids() -> list[dict]:
    """
    Returns list of {public_id, bytes, created_at} for every resource under
    CLOUDINARY_FOLDER_PREFIX, paginated via next_cursor.
    """
    assets = []
    next_cursor = None

    while True:
        kwargs = {"max_results": PAGE_SIZE, "resource_type": "image"}
        if CLOUDINARY_FOLDER_PREFIX:
            kwargs["type"] = "upload"
            kwargs["prefix"] = CLOUDINARY_FOLDER_PREFIX
        if next_cursor:
            kwargs["next_cursor"] = next_cursor

        resp = cloudinary.api.resources(**kwargs)
        for res in resp.get("resources", []):
            assets.append(
                {
                    "public_id": res["public_id"],
                    "bytes": res.get("bytes", 0),
                    "created_at": res.get("created_at"),
                }
            )

        next_cursor = resp.get("next_cursor")
        if not next_cursor:
            break

    return assets


async def find_orphaned_cloudinary_assets(ctx, dry_run: bool = True) -> dict:
    """
    Diffs Cloudinary storage against every DB reference and reports (or, if
    dry_run=False, deletes) assets with zero remaining references anywhere.
    """
    pool: asyncpg.Pool = ctx["db_pool"]
    logger.info("[cloudinary_reconcile] starting sweep")

    referenced_ids = await _get_all_referenced_public_ids(pool)
    logger.info(f"[cloudinary_reconcile] {len(referenced_ids)} public_ids referenced in DB")

    all_assets = _get_all_cloudinary_public_ids()
    logger.info(f"[cloudinary_reconcile] {len(all_assets)} assets found in Cloudinary")

    orphans = [a for a in all_assets if a["public_id"] not in referenced_ids]
    orphan_bytes = sum(a["bytes"] for a in orphans)
    orphan_mb = orphan_bytes / (1024 * 1024)

    deleted, failed = [], []
    if not dry_run and orphans:
        # Cloudinary's destroy is per-asset; batch via delete_resources for
        # efficiency (accepts up to 100 public_ids per call).
        public_ids = [a["public_id"] for a in orphans]
        for i in range(0, len(public_ids), 100):
            batch = public_ids[i : i + 100]
            try:
                result = cloudinary.api.delete_resources(batch)
                for pid, status in result.get("deleted", {}).items():
                    if status == "deleted":
                        deleted.append(pid)
                    else:
                        failed.append(pid)
            except Exception as e:
                logger.error(f"[cloudinary_reconcile] batch delete failed: {e}")
                failed.extend(batch)

    summary = {
        "dry_run": dry_run,
        "referenced_count": len(referenced_ids),
        "total_cloudinary_assets": len(all_assets),
        "orphan_count": len(orphans),
        "orphan_size_mb": round(orphan_mb, 1),
        "deleted_count": len(deleted),
        "failed_count": len(failed),
    }
    _log_summary(summary)

    return {**summary, "orphan_public_ids": [a["public_id"] for a in orphans]}


def _log_summary(summary: dict) -> None:
    """
    Emits a Slack-friendly summary at a level that matches actual severity:
      - INFO  (console only): nothing orphaned, or a clean dry run with 0 hits
      - WARNING (-> Slack): orphans detected, either reported (dry run) or
        successfully cleaned up
      - ERROR (-> Slack): live deletion attempted but some assets failed
    """
    label = "DRY RUN" if summary["dry_run"] else "LIVE"
    lines = [
        f"[cloudinary_reconcile] {label} summary:",
        f"  scanned: {summary['total_cloudinary_assets']} Cloudinary assets, "
        f"{summary['referenced_count']} referenced in DB",
        f"  orphans found: {summary['orphan_count']} "
        f"({summary['orphan_size_mb']} MB)",
    ]
    if not summary["dry_run"]:
        lines.append(
            f"  deleted: {summary['deleted_count']}, failed: {summary['failed_count']}"
        )
    text = "\n".join(lines)

    if summary["failed_count"] > 0:
        logger.error(text)
    elif summary["orphan_count"] > 0:
        logger.warning(text)
    else:
        logger.info(text)