from typing import Any, Optional, List, Dict
import random
import asyncio
from fastapi import HTTPException
from app.core.logging import get_logger
from app.core.utils import slugify, generate_sku
from app.prisma_client import Prisma
from app.models.gallery import PaginatedProductImages
from app.models.generic import ImageBulkDelete
from app.models.product import (
    ProductImageMetadata,
    ImagesBulkUpdate,
    ProductImageBulkUrls,
)

logger = get_logger(__name__)

class GalleryRepository:
    """Encapsulates all direct database access layers."""
    def __init__(self, db: Prisma):
        self.db = db

    async def get_paginated_gallery(
        self, cursor: Optional[int], limit: int, sort: str, active: Optional[bool], out_of_stock: bool
    ) -> List[Dict[str, Any]]:
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
                    WHERE pv2.product_id = p.id
                    AND pv2.inventory > 0
                )
            """)

        extra_filters_sql = "\n".join(extra_filters)
        
        query = f"""
            SELECT 
                pi.id, pi.image, pi."order", pi.product_id,
                p.id AS p_id, p.sku AS p_sku, p.name AS p_name,
                p.description AS p_description, p.slug AS p_slug,
                p.active AS p_active, p.is_new AS p_is_new,
                COALESCE(JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', pv.id, 'sku', pv.sku, 'product_id', pv.product_id, 'price', pv.price, 'old_price', pv.old_price, 'inventory', pv.inventory, 'status', pv.status, 'size', pv.size, 'color', pv.color, 'width', pv.width, 'length', pv.length, 'age', pv.age)) FILTER (WHERE pv.id IS NOT NULL), '[]') AS variants,
                COALESCE(JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', pc.id, 'name', pc.name, 'slug', pc.slug)) FILTER (WHERE pc.id IS NOT NULL), '[]') AS categories,
                COALESCE(JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', col.id, 'name', col.name, 'slug', col.slug)) FILTER (WHERE col.id IS NOT NULL), '[]') AS collections
            FROM "product_images" pi
            LEFT JOIN "products" p ON p.id = pi.product_id
            LEFT JOIN "product_variants" pv ON pv.product_id = p.id
            LEFT JOIN "_ProductCategories" cp ON cp."B" = p.id
            LEFT JOIN "categories" pc ON pc.id = cp."A"
            LEFT JOIN "_ProductCollections" clp ON clp."B" = p.id
            LEFT JOIN "collections" col ON col.id = clp."A"
            WHERE pi."order" = 0 AND pi.id {cursor_op} $1 {extra_filters_sql}
            GROUP BY pi.id, p.id ORDER BY pi.id {order_dir} LIMIT $2
        """
        return await self.db.query_raw(query, cursor or cursor_default, limit + 1)


class GalleryService:
    """Coordinates Business Domain Logics."""
    def __init__(self, repo: GalleryRepository, db: Prisma, websocket_manager, recently_viewed_service):
        self.repo = repo
        self.db = db
        self.ws_manager = websocket_manager
        self.recently_viewed_service = recently_viewed_service

    @staticmethod
    def _build_variant_data(payload) -> dict[str, Any]:
        data = {}
        fields = ["size", "color", "width", "length", "age", "price", "old_price"]
        for field in fields:
            if getattr(payload, field, None) is not None:
                data[field] = getattr(payload, field)
        
        if getattr(payload, "inventory", None) is not None:
            data["inventory"] = payload.inventory
            data["status"] = "IN_STOCK" if payload.inventory > 0 else "OUT_OF_STOCK"
        return data

    @staticmethod
    def _build_relation_data(category_ids=None, collection_ids=None) -> dict[str, Any]:
        data: dict[str, Any] = {}
        if category_ids:
            data["categories"] = {"connect": [{"id": cid} for cid in category_ids]}
        if collection_ids:
            data["collections"] = {"connect": [{"id": cid} for cid in collection_ids]}
        return data

    async def get_gallery_items(self, **kwargs) -> PaginatedProductImages:
        limit = kwargs.get("limit", 36)
        try:
            images = await self.repo.get_paginated_gallery(**kwargs)
        except Exception as e:
            logger.error(f"Gallery fetch error: {e}")
            raise HTTPException(status_code=500, detail=str(e))

        has_more = len(images) > limit
        items = images[:limit]

        shaped = [
            {
                "id": img["id"],
                "image": img["image"],
                "order": img["order"],
                "product_id": img["product_id"],
                "product": {
                    "id": img["p_id"],
                    "sku": img["p_sku"],
                    "name": img["p_name"],
                    "description": img["p_description"],
                    "slug": img["p_slug"],
                    "active": img["p_active"],
                    "is_new": img["p_is_new"],
                    "categories": img["categories"],
                    "collections": img["collections"],
                    "variants": img["variants"],
                } if img["p_id"] else None,
            } for img in items
        ]

        return {
            "items": shaped,
            "next_cursor": items[-1]["id"] if has_more and items else None,
            "limit": limit,
        }

    async def delete_image(self, image_id: int) -> tuple[Optional[int], list[str]]:
        """Deletes an image or its parent product synchronously within transactional bounds."""
        image = await self.db.productimage.find_unique(where={"id": image_id})
        if not image:
            raise HTTPException(status_code=404, detail="Image not found")

        if not image.product_id:
            await self.db.productimage.delete(where={"id": image_id})
            return None, [image.image]

        product_id = image.product_id
        try:
            async with self.db.tx() as tx:
                images = await tx.productimage.find_many(where={"product_id": product_id})
                image_urls = [img.image for img in images]

                await asyncio.gather(
                    tx.productimage.delete_many(where={"product_id": product_id}),
                    tx.review.delete_many(where={"product_id": product_id}),
                    tx.productvariant.delete_many(where={"product_id": product_id}),
                )
                await tx.product.delete(where={"id": product_id})
        except Exception as e:
            logger.error(f"Error deleting product {product_id}: {e}")
            raise HTTPException(status_code=500, detail="Failed to delete product")

        await self.recently_viewed_service.remove_product_from_all(product_id=product_id)
        return product_id, image_urls

    async def bulk_save_urls(self, payload: ProductImageBulkUrls) -> dict:
        if not payload.urls:
            raise HTTPException(status_code=400, detail="No images provided")

        create_rows = [{"image": url, "order": 0} for url in payload.urls]
        try:
            await self.db.productimage.create_many(data=create_rows)
            return {"success": True, "count": len(create_rows)}
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=500, detail=str(e))

    async def process_bulk_delete_task(self, payload: ImageBulkDelete, remove_storage_fn, delete_index_fn):
        images = await self.db.productimage.find_many(
            where={"id": {"in": payload.files}}, include={"product": True}
        )
        if not images:
            await self.ws_manager.broadcast_to_all({"status": "failed", "error": "No images found"}, "bulk_action")
            return

        try:
            product_ids = list({img.product_id for img in images if img.product_id})
            await self.db.productimage.delete_many(where={"id": {"in": [img.id for img in images]}})

            results = await asyncio.gather(
                remove_storage_fn([img.image for img in images]),
                delete_index_fn(product_ids),
                return_exceptions=True,
            )
            errors = [r for r in results if isinstance(r, Exception)]
            if errors:
                logger.error(f"Some delete tasks failed: {errors}")

            await self.ws_manager.broadcast_to_all({"status": "completed"}, "bulk_action")
        except Exception as e:
            logger.error(f"Error processing bulk delete: {str(e)}")
            await self.ws_manager.broadcast_to_all({"status": "failed", "error": str(e)}, "bulk_action")

    async def create_metadata(self, image_id: int, payload: ProductImageMetadata) -> int:
        if not payload.name:
            raise HTTPException(status_code=400, detail="Product name is required")

        existing_image = await self.db.productimage.find_unique(where={"id": image_id})
        if not existing_image:
            raise HTTPException(status_code=404, detail="Image not found")
        if existing_image.product_id is not None:
            raise HTTPException(status_code=400, detail="Image is already linked to a product")

        slugified_name = slugify(payload.name)
        conflict = await self.db.product.find_first(where={"slug": slugified_name})
        if conflict:
            raise HTTPException(status_code=400, detail="A product with this name already exists")

        try:
            async with self.db.tx() as tx:
                product_data = {
                    "name": payload.name,
                    "slug": slugified_name,
                    "sku": generate_sku(),
                    "description": payload.description,
                    "active": True,
                    "is_new": payload.is_new if payload.is_new is not None else False,
                    "image": existing_image.image,
                    **self._build_relation_data(payload.category_ids, payload.collection_ids)
                }

                product = await tx.product.create(data=product_data)
                await tx.productimage.update(where={"id": image_id}, data={"product": {"connect": {"id": product.id}}})

                if payload.variants:
                    async def _create_variant(v):
                        await tx.productvariant.create(data={
                            "sku": generate_sku(), "price": v.price, "old_price": v.old_price,
                            "inventory": v.inventory, "product_id": product.id,
                            "status": "IN_STOCK" if v.inventory > 0 else "OUT_OF_STOCK",
                            "size": v.size, "color": v.color, "width": v.width, "length": v.length, "age": v.age,
                        })
                    await asyncio.gather(*[_create_variant(v) for v in payload.variants])
                return product.id
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating product for image {image_id}: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def update_metadata(self, image_id: int, payload: ProductImageMetadata) -> int:
        existing_image = await self.db.productimage.find_unique(where={"id": image_id})
        if not existing_image:
            raise HTTPException(status_code=404, detail="Image not found")

        if payload.name is not None:
            new_slug = slugify(payload.name)
            conflict = await self.db.product.find_first(where={"slug": new_slug, "id": {"not": existing_image.product_id}})
            if conflict:
                raise HTTPException(status_code=400, detail="A product with this name already exists")

        try:
            async with self.db.tx() as tx:
                update_data = {}
                if payload.name is not None:
                    update_data["name"] = payload.name
                    update_data["slug"] = slugify(payload.name)
                if payload.description is not None:
                    update_data["description"] = payload.description
                if payload.category_ids is not None:
                    update_data["categories"] = {"set": [{"id": cid} for cid in payload.category_ids]}
                if payload.collection_ids is not None:
                    update_data["collections"] = {"set": [{"id": cid} for cid in payload.collection_ids]}
                if payload.active is not None:
                    update_data["active"] = payload.active
                if payload.is_new is not None:
                    update_data["is_new"] = payload.is_new

                if update_data:
                    await tx.product.update(where={"id": existing_image.product_id}, data=update_data)

                if payload.variants:
                    async def _upsert_variant(v):
                        v_data = {
                            "price": v.price, "old_price": v.old_price, "inventory": v.inventory,
                            "status": "IN_STOCK" if v.inventory > 0 else "OUT_OF_STOCK",
                            "size": v.size, "color": v.color, "width": v.width, "length": v.length, "age": v.age,
                        }
                        if v.id:
                            await tx.productvariant.update(where={"id": v.id}, data=v_data)
                        else:
                            await tx.productvariant.create(data={
                                **v_data, "product_id": existing_image.product_id,
                                "sku": generate_sku(), "image": existing_image.image
                            })
                    await asyncio.gather(*[_upsert_variant(v) for v in payload.variants])
                return existing_image.product_id
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating image metadata {image_id}: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def _process_single_image(self, image, payload: ImagesBulkUpdate, created_product_ids: list) -> None:
        if image.product_id is None:
            name = f"{random.choice(['Classic', 'Premium', 'Superior', 'Deluxe', 'Luxury'])} {random.randint(10000, 99999)}"
            slug = slugify(name)
            existing = await self.db.product.find_first(where={"slug": slug})
            if existing:
                slug = f"{slug}-{generate_sku().lower()}"

            product_data = {
                "name": name, "slug": slug, "sku": generate_sku(),
                "active": payload.data.active if payload.data.active is not None else True,
                "is_new": payload.data.is_new or False,
                **self._build_relation_data(payload.data.category_ids, payload.data.collection_ids),
            }
            variant_data = {
                "sku": generate_sku(), "price": payload.data.price or 1, "inventory": payload.data.inventory or 0,
                **self._build_variant_data(payload.data),
            }

            async with self.db.tx(timeout=15000) as tx:
                product = await tx.product.create(data=product_data)
                await tx.productimage.update(where={"id": image.id}, data={"product": {"connect": {"id": product.id}}})
                await tx.productvariant.create(data={**variant_data, "product_id": product.id})
            created_product_ids.append(product.id)
        else:
            created_product_ids.append(image.product_id)
            relation_updates = {}
            if payload.data.category_ids:
                relation_updates["categories"] = {"set": [{"id": cid} for cid in payload.data.category_ids]}
            if payload.data.collection_ids:
                relation_updates["collections"] = {"set": [{"id": cid} for cid in payload.data.collection_ids]}
            if payload.data.is_new is not None:
                relation_updates["is_new"] = payload.data.is_new
            if payload.data.active is not None:
                relation_updates["active"] = payload.data.active

            v_data = self._build_variant_data(payload.data)
            first_variant_id = image.product.variants[0].id if v_data and image.product and image.product.variants else None

            if relation_updates or (v_data and first_variant_id):
                async with self.db.tx(timeout=15000) as tx:
                    if relation_updates:
                        await tx.product.update(where={"id": image.product_id}, data=relation_updates)
                    if v_data and first_variant_id:
                        await tx.productvariant.update(where={"id": first_variant_id}, data=v_data)

    async def handle_bulk_update_products(self, payload: ImagesBulkUpdate, images, index_products_fn) -> None:
        failed_ids = []
        created_product_ids = []

        for image in images:
            try:
                await self._process_single_image(image, payload, created_product_ids)
            except Exception as e:
                logger.error(f"Error processing image {image.id}: {e}")
                failed_ids.append(image.id)
                
        await index_products_fn(product_ids=created_product_ids)
        status = "completed" if not failed_ids else "partial"
        await self.ws_manager.broadcast_to_all({
            "status": status, "failed_ids": failed_ids, "success_count": len(images) - len(failed_ids)
        }, "bulk_action")