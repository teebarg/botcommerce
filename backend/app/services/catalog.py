from typing import Optional
from app.core.logging import logger
from math import ceil
from app.services.cache import CacheService


class CatalogService:
    def __init__(self, db, cache_srv: CacheService):
        self.db = db
        self.cache_srv = cache_srv

    async def track_visit(
        self,
        catalog_id: int,
        user_id: Optional[int] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> bool:
        """Track a unique visit to a catalog."""
        async with self.db.tx() as tx:
            try:
                if user_id:
                    existing_view = await self.db.sharedcollectionview.find_first(
                        where={
                            "shared_collection_id": catalog_id,
                            "user_id": user_id,
                        }
                    )
                else:
                    existing_view = await self.db.sharedcollectionview.find_first(
                        where={
                            "shared_collection_id": catalog_id,
                            "user_id": None,
                            "ip_address": ip_address,
                            "user_agent": user_agent,
                        }
                    )

                if existing_view:
                    return False

                data = {
                    "shared_collection": {"connect": {"id": catalog_id}},
                    "ip_address": ip_address,
                    "user_agent": user_agent,
                }
                if user_id:
                    data["user"] = {"connect": {"id": user_id}}

                await tx.sharedcollectionview.create(data=data)
                await tx.sharedcollection.update(
                    where={"id": catalog_id},
                    data={"view_count": {"increment": 1}},
                )
                return True

            except Exception as e:
                logger.error(f"Error tracking visit: {e}")
                return False

    async def get_visit_count(self, catalog_id: int) -> int:
        """Get the total number of unique visits for a catalog."""
        try:
            return await self.db.sharedcollectionview.count(
                where={"shared_collection_id": catalog_id}
            )
        except Exception as e:
            logger.error(f"Error getting visit count: {e}")
            return 0

    async def list(
        self,
        skip: int = 0,
        limit: int = 20,
        is_active: Optional[bool] = None,
        product_id: Optional[int] = None,
    ) -> dict:
        """List catalogs with product count, filtered and paginated."""
        filters = []
        if product_id is not None:
            filters.append(
                f'EXISTS (SELECT 1 FROM "_SharedCollectionProducts" ps WHERE ps."B" = sc.id AND ps."A" = {product_id})'
            )
        if is_active is not None:
            filters.append(f"sc.is_active = {str(is_active).lower()}")

        where_clause = " AND ".join(filters) if filters else "TRUE"

        catalog_rows = await self.db.query_raw(
            f"""
            SELECT sc.id, sc.slug, sc.title, sc.description, sc.is_active, sc.view_count, created_at,
                   COUNT(ps."A") AS products_count
            FROM "shared_collections" sc
            LEFT JOIN "_SharedCollectionProducts" ps ON sc.id = ps."B"
            WHERE {where_clause}
            GROUP BY sc.id
            ORDER BY sc.created_at DESC
            OFFSET {skip}
            LIMIT {limit}
            """
        )

        total_result = await self.db.query_raw(
            f"""
            SELECT COUNT(*)::int AS count
            FROM (
                SELECT sc.id
                FROM "shared_collections" sc
                WHERE {where_clause}
            ) sub
            """
        )
        total = total_result[0]["count"]

        return {
            "catalogs": catalog_rows,
            "skip": skip,
            "limit": limit,
            "total_pages": ceil(total / limit) if limit else 1,
            "total_count": total,
        }

    async def invalidate(self, slug: Optional[str] = None) -> None:
        """Invalidate catalog."""
        tags = ["catalogs"]
        if slug:
            tags.append(f"catalog:{slug}")
        await self.cache_srv.invalidate(tags=tags)
