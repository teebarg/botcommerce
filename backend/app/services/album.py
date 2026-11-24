import json
import secrets
import string
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any

from fastapi import HTTPException
from prisma.errors import UniqueViolationError

from app.core.config import settings
from app.core.logging import get_logger
from app.models.album import AlbumProduct, AlbumPublic, AlbumSummary

if TYPE_CHECKING:
    from app.services.cache import CacheService
    from app.services.cdn import CdnService
    from app.services.product import ProductService
    from prisma import Prisma

logger = get_logger(__name__)

KEY_PREFIX = "album:"
CODE_LENGTH = 8
# Lowercase + digits only: no "_" or "-" that apps may turn into formatting.
CODE_ALPHABET = string.ascii_lowercase + string.digits


class AlbumService:
    def __init__(
        self,
        db: "Prisma",
        product_srv: "ProductService",
        cache_srv: "CacheService",
        cdn_srv: "CdnService",
    ):
        self.db = db
        self.product_srv = product_srv
        self.cache_srv = cache_srv
        self.cdn_srv = cdn_srv

    @staticmethod
    def _key(code: str) -> str:
        return f"{KEY_PREFIX}{code}"

    @staticmethod
    def _code_from_key(key: str) -> str:
        return key.removeprefix(KEY_PREFIX)

    @staticmethod
    def url(code: str) -> str:
        return f"{settings.FRONTEND_HOST.rstrip('/')}/album/{code}"

    @staticmethod
    def _parse(value: str | None) -> dict[str, Any] | None:
        """Decode a stored row. Returns None for anything malformed instead of
        raising, so one bad row can't break the admin list or a public page."""
        if not value:
            return None
        try:
            data = json.loads(value)
        except (TypeError, ValueError):
            return None
        if not isinstance(data, dict):
            return None
        ids = data.get("product_ids")
        if not isinstance(ids, list) or not all(isinstance(i, int) for i in ids):
            return None
        return {"title": str(data.get("title") or "Fashion album"), "product_ids": ids}

    async def create(self, title: str, product_ids: list[int]) -> str:
        # De-duplicate.
        ids = list(dict.fromkeys(product_ids))

        existing = await self.db.product.find_many(where={"id": {"in": ids}})
        found = {p.id for p in existing}
        missing = [i for i in ids if i not in found]
        if missing:
            raise HTTPException(
                status_code=400, detail=f"Unknown product ids: {missing}"
            )

        payload = json.dumps(
            {
                "title": title,
                "product_ids": ids,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )

        for _ in range(5):
            code = "".join(secrets.choice(CODE_ALPHABET) for _ in range(CODE_LENGTH))
            try:
                await self.db.siteconfig.create(
                    data={"key": self._key(code), "value": payload}
                )
                return code
            except UniqueViolationError:
                continue

        logger.error("Could not generate a unique album code after 5 attempts")
        raise HTTPException(status_code=500, detail="Could not create album")

    async def list(self) -> list[AlbumSummary]:
        rows = await self.db.siteconfig.find_many(
            where={"key": {"startswith": KEY_PREFIX}},
            order={"created_at": "desc"},
        )
        summaries: list[AlbumSummary] = []
        for row in rows:
            data = self._parse(row.value)
            if data is None:
                logger.warning(f"Skipping malformed album row {row.key}")
                continue
            code = self._code_from_key(row.key)
            summaries.append(
                AlbumSummary(
                    code=code,
                    title=data["title"],
                    product_count=len(data["product_ids"]),
                    url=self.url(code),
                )
            )
        return summaries

    async def delete(self, code: str) -> None:
        row = await self.db.siteconfig.find_unique(where={"key": self._key(code)})
        if not row:
            raise HTTPException(status_code=404, detail="Album not found")
        await self.db.siteconfig.delete(where={"key": self._key(code)})
        await self.invalidate(code)


    async def get_public(self, code: str) -> AlbumPublic:
        row = await self.db.siteconfig.find_unique(where={"key": self._key(code)})
        data = self._parse(row.value) if row else None
        if data is None:
            raise HTTPException(status_code=404, detail="Album not found")

        ids: list[int] = data["product_ids"]
        products = await self.db.product.find_many(
            where={"id": {"in": ids}, "active": True},
            include={"variants": True, "images": True},
        )
        by_id = {p.id: p for p in products}

        items: list[AlbumProduct] = []
        # Deleted or deactivated products are simply skipped.
        for pid in ids:
            product = by_id.get(pid)
            if product is None:
                continue
            doc = self.product_srv.product_to_search_document(product)
            for variant in doc.get("variants", []):
                status = variant.get("status")
                variant["status"] = getattr(status, "value", status)
            items.append(AlbumProduct.model_validate(doc))

        return AlbumPublic(title=data["title"], products=items)

    async def invalidate(self, code: str) -> None:
        await self.cdn_srv.purge_cloudfare(f"/api/album/{code}")
        await self.cache_srv.invalidate(f"album:{code}")