import logging
from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status
from prisma import Prisma
from app.models.gallery import (
    PaginatedProductImages, 
    ProductImageResponse, 
    BulkUploadSchema, 
    BulkDeleteSchema,
    MetadataUpdateSchema
)

logger = logging.getLogger(__name__)

class GalleryService:
    def __init__(self, db_client: Prisma):
        self.db = db_client

    async def get_paginated_gallery(
        self,
        cursor: Optional[int] = None,
        limit: int = 36,
        sort: str = "newest",
        active: Optional[bool] = None,
        out_of_stock: bool = False,
    ) -> PaginatedProductImages:
        order_dir = "ASC" if sort == "oldest" else "DESC"
        cursor_op = ">" if sort == "oldest" else "<"
        cursor_default = 0 if sort == "oldest" else 2147483647

        extra_filters = []
        if active is not None:
            extra_filters.append(f"AND p.active = {str(active).lower()}")
        if out_of_stock:
            extra_filters.append("""
                AND NOT EXISTS (
                    SELECT 1 FROM "product_variants" pv2 
                    WHERE pv2.product_id = p.id AND pv2.inventory > 0
                )
            """)
        
        filter_sql = "\n".join(extra_filters)
        query = f"""
            SELECT 
                pi.id, pi.image, pi."order", pi.product_id,
                p.id AS p_id, p.sku AS p_sku, p.name AS p_name, 
                p.description AS p_description, p.slug AS p_slug, 
                p.active AS p_active, p.is_new AS p_is_new,
                COALESCE(
                    JSON_AGG(
                        DISTINCT JSONB_BUILD_OBJECT(
                            'id', pv.id, 'sku', pv.sku, 'product_id', pv.product_id,
                            'price', pv.price, 'old_price', pv.old_price, 
                            'inventory', pv.inventory, 'status', pv.status,
                            'size', pv.size, 'color', pv.color, 'width', pv.width, 
                            'length', pv.length, 'age', pv.age
                        )
                    ) FILTER (WHERE pv.id IS NOT NULL), '[]'
                ) AS variants,
                COALESCE(
                    JSON_AGG(
                        DISTINCT JSONB_BUILD_OBJECT(
                            'id', pc.id, 'name', pc.name, 'slug', pc.slug
                        )
                    ) FILTER (WHERE pc.id IS NOT NULL), '[]'
                ) AS categories,
                COALESCE(
                    JSON_AGG(
                        DISTINCT JSONB_BUILD_OBJECT(
                            'id', col.id, 'name', col.name, 'slug', col.slug
                        )
                    ) FILTER (WHERE col.id IS NOT NULL), '[]'
                ) AS collections
            FROM "product_images" pi
            LEFT JOIN "products" p ON p.id = pi.product_id
            LEFT JOIN "product_variants" pv ON pv.product_id = p.id
            LEFT JOIN "_ProductCategories" cp ON cp."B" = p.id
            LEFT JOIN "categories" pc ON pc.id = cp."A"
            LEFT JOIN "_ProductCollections" clp ON clp."B" = p.id
            LEFT JOIN "collections" col ON col.id = clp."A"
            WHERE pi."order" = 0
              AND pi.id {cursor_op} {cursor or cursor_default}
              {filter_sql}
            GROUP BY pi.id, p.id
            ORDER BY pi.id {order_dir}
            LIMIT {limit + 1};
        """
        try:
            raw_records: List[Dict[str, Any]] = await self.db.query_raw(query)
        except Exception as e:
            logger.error(f"Gallery Raw SQL error: {e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database read failure during gallery lookup."
            )

        items = raw_records[:limit]
        next_cursor = items[-1]["id"] if len(raw_records) > limit else None

        return PaginatedProductImages(items=items, next_cursor=next_cursor, limit=limit)

    async def create_image_metadata(self, product_id: Optional[int], image_url: str, order: int = 0) -> ProductImageResponse:
        """Creates image metadata. product_id is optional to allow unlinked states."""
        if product_id:
            product = await self.db.products.find_unique(where={"id": product_id})
            if not product:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target Product context not found.")

        try:
            record = await self.db.productimages.create(
                data={"product_id": product_id, "image": image_url, "order": order}
            )
            return ProductImageResponse.model_validate(record)
        except Exception as e:
            logger.error(f"Failed creating image metadata: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database write failure.")

    async def update_image_metadata(self, image_id: int, payload: MetadataUpdateSchema) -> ProductImageResponse:
        record = await self.db.productimages.find_unique(where={"id": image_id})
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery metadata record not found.")

        update_data: Dict[str, Any] = {}
        if payload.order is not None:
            update_data["order"] = payload.order
        if payload.image_url is not None:
            update_data["image"] = payload.image_url

        try:
            updated = await self.db.productimages.update(where={"id": image_id}, data=update_data)
            return ProductImageResponse.model_validate(updated)
        except Exception as e:
            logger.error(f"Failed updating image metadata: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed updating metadata record.")

    async def delete_gallery_image(self, image_id: int) -> None:
        record = await self.db.productimages.find_unique(where={"id": image_id})
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target asset metadata not found.")

        try:
            await self.db.productimages.delete(where={"id": image_id})
        except Exception as e:
            logger.error(f"Error purging image element: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Entity synchronized purge failed.")

    async def bulk_upload_images(self, payload: BulkUploadSchema) -> List[ProductImageResponse]:
        """
        Processes multi-image registrations atomically within an unlinked asset pipeline.
        """
        if not payload.urls:
            raise HTTPException(status_code=400, detail="No images provided")

        try:
            async with self.db.tx() as tx:
                created_records = []
                for idx, img_url in enumerate(payload.images):
                    record = await tx.productimages.create(
                        data={
                            "product_id": payload.product_id, 
                            "image": img_url, 
                            "order": idx
                        }
                    )
                    created_records.append(ProductImageResponse.model_validate(record))
                return created_records
        except Exception as e:
            logger.error(f"Bulk addition operational rollback executed: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Batch allocation transaction aborted due to an internal system error."
            )

    async def bulk_delete_images(self, payload: BulkDeleteSchema) -> Dict[str, int]:
        try:
            delete_result = await self.db.productimages.delete_many(
                where={"id": {"in": payload.image_ids}}
            )
            return {"deleted_count": delete_result}
        except Exception as e:
            logger.error(f"Bulk erasure failure sequence: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to drop specified collection records.")