import asyncio
import json
import random
from typing import Any, Dict, List, Optional

from fastapi import HTTPException

from app.core.logging import get_logger
from app.core.utils import generate_sku, slugify
from app.core.variants import attributes_key, live_variants
from app.models.gallery import PaginatedGalleryImages
from app.models.generic import ImageBulkDelete
from app.models.product import (
    ImagesBulkUpdate,
    BulkAddProductVariants,
    ProductImageBulkUrls,
    ProductImageMetadata,
)
from app.prisma_client import Prisma
from app.services.cache import CacheService
from prisma.fields import Json

logger = get_logger(__name__)


class GalleryService:
    """Coordinates Business Domain Logics."""
    def __init__(self, db: Prisma, websocket_manager, cache_srv: CacheService):
        self.db = db
        self.ws_manager = websocket_manager
        self.cache_srv = cache_srv

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
    def _validate_dynamic_variants(payload: ProductImageMetadata) -> None:
        if payload.options is None or not payload.options:
            return
        if not payload.variants:
            raise HTTPException(status_code=400, detail="Generate at least one variant for the configured attributes")

        names = [option.name.strip() for option in payload.options]
        if any(not name for name in names) or len({name.casefold() for name in names}) != len(names):
            raise HTTPException(status_code=400, detail="Attribute names must be non-empty and unique")

        normalized_values: dict[str, set[str]] = {}
        for option, name in zip(payload.options, names):
            values = [value.strip() for value in option.values]
            if any(not value for value in values) or len(set(values)) != len(values):
                raise HTTPException(status_code=400, detail=f"Values for {name} must be non-empty and unique")
            normalized_values[name] = set(values)

        seen_combinations: set[tuple[tuple[str, str], ...]] = set()
        for variant in payload.variants or []:
            attributes = variant.attributes or {}
            combination = tuple(sorted(attributes.items()))
            if combination in seen_combinations:
                raise HTTPException(status_code=400, detail="Duplicate variant combination")
            seen_combinations.add(combination)
            if set(attributes) != set(normalized_values):
                raise HTTPException(status_code=400, detail="Every variant must contain a value for each product attribute")
            for name, value in attributes.items():
                if value not in normalized_values[name]:
                    raise HTTPException(status_code=400, detail=f"Invalid {name} value: {value}")

    @staticmethod
    def _build_relation_data(category_ids=None, collection_ids=None) -> dict[str, Any]:
        data: dict[str, Any] = {}
        if category_ids:
            data["categories"] = {"connect": [{"id": cid} for cid in category_ids]}
        if collection_ids:
            data["collections"] = {"connect": [{"id": cid} for cid in collection_ids]}
        return data


    async def get_paginated_gallery(
        self, cursor: Optional[int], limit: int, sort: str, active: Optional[bool], inventory: str,
        category_slug: Optional[str] = None, name: Optional[str] = None,
        start_date: Optional[str] = None, end_date: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        order_dir = "ASC" if sort == "oldest" else "DESC"
        cursor_op = ">" if sort == "oldest" else "<"
        cursor_default = 0 if sort == "oldest" else 2147483647

        extra_filters = []
        if active is not None:
            extra_filters.append(f"AND p.active = {str(active).lower()}")

        if inventory == "out_of_stock":
            extra_filters.append("""
                AND NOT EXISTS (
                    SELECT 1 FROM "product_variants" pv2
                    WHERE pv2.product_id = p.id
                    AND pv2.inventory > 0
                )
            """)
        elif inventory == "in_stock":
            extra_filters.append("""
                AND EXISTS (
                    SELECT 1 FROM "product_variants" pv2
                    WHERE pv2.product_id = p.id
                    AND pv2.inventory > 0
                )
            """)

        args: list = [cursor or cursor_default, limit + 1]
        param_index = 3

        if category_slug:
            extra_filters.append(f"""
                AND EXISTS (
                    SELECT 1 FROM "_ProductCategories" cp2
                    JOIN "categories" pc2 ON pc2.id = cp2."A"
                    WHERE cp2."B" = p.id AND pc2.slug = ${param_index}
                )
            """)
            args.append(category_slug)
            param_index += 1

        if name:
            extra_filters.append(f'AND p.name ILIKE ${param_index}')
            args.append(f"%{name}%")
            param_index += 1

        if start_date:
            extra_filters.append(f'AND pi.created_at >= ${param_index}::timestamptz')
            args.append(start_date)
            param_index += 1

        if end_date:
            extra_filters.append(f'AND pi.created_at <= ${param_index}::timestamptz')
            args.append(end_date)
            param_index += 1

        extra_filters_sql = "\n".join(extra_filters)

        query: str = f"""
            SELECT
                pi.id, pi.image, pi."order", pi.product_id,
                p.id AS p_id, p.sku AS p_sku, p.name AS p_name,
                p.description AS p_description, p.slug AS p_slug,
                p.active AS p_active, p.is_new AS p_is_new, p.options AS p_options,
                COALESCE(
                    JSON_AGG(
                        DISTINCT JSONB_BUILD_OBJECT(
                            'id', pi2.id,
                            'image', pi2.image,
                            'order', pi2."order"
                        )
                    ) FILTER (WHERE pi2.id IS NOT NULL),
                    '[]'
                ) AS images,
                COALESCE(JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', pv.id, 'sku', pv.sku, 'product_id', pv.product_id, 'price', pv.price, 'old_price', pv.old_price, 'inventory', pv.inventory, 'status', pv.status, 'size', pv.size, 'color', pv.color, 'width', pv.width, 'length', pv.length, 'age', pv.age, 'attributes', pv.attributes)) FILTER (WHERE pv.id IS NOT NULL), '[]') AS variants,
                COALESCE(JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', pc.id, 'name', pc.name, 'slug', pc.slug)) FILTER (WHERE pc.id IS NOT NULL), '[]') AS categories,
                COALESCE(JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', col.id, 'name', col.name, 'slug', col.slug)) FILTER (WHERE col.id IS NOT NULL), '[]') AS collections
            FROM "product_images" pi
            LEFT JOIN "product_images" pi2 ON pi2.product_id = pi.product_id
            LEFT JOIN "products" p ON p.id = pi.product_id
            LEFT JOIN "product_variants" pv ON pv.product_id = p.id
            LEFT JOIN "_ProductCategories" cp ON cp."B" = p.id
            LEFT JOIN "categories" pc ON pc.id = cp."A"
            LEFT JOIN "_ProductCollections" clp ON clp."B" = p.id
            LEFT JOIN "collections" col ON col.id = clp."A"
            WHERE pi."order" = 0 AND pi.id {cursor_op} $1 {extra_filters_sql}
            GROUP BY pi.id, p.id ORDER BY pi.id {order_dir} LIMIT $2
        """
        return await self.db.query_raw(query, *args)

    async def get_gallery_items(self, **kwargs) -> PaginatedGalleryImages:
        limit = kwargs.get("limit", 40)
        try:
            images = await self.get_paginated_gallery(**kwargs)
        except Exception as e:
            logger.error(f"Gallery fetch error: {e}")
            raise HTTPException(status_code=500, detail=str(e))

        has_more = len(images) > limit
        items = images[:limit]

        def _json(value, default):
            if isinstance(value, str):
                try:
                    return json.loads(value)
                except ValueError:
                    return default
            return value if value is not None else default

        def _visible_variants(img) -> list:
            return live_variants({
                "variants": _json(img["variants"], []),
                "options": _json(img["p_options"], []),
            })

        shaped = [
            {
                "id": img["id"],
                "image": img["image"],
                "images": img["images"],
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
                    "options": img["p_options"] or [],
                    "categories": img["categories"],
                    "collections": img["collections"],
                    "variants": _visible_variants(img),
                } if img["p_id"] else None,
            } for img in items
        ]

        return {
            "items": shaped,
            "next_cursor": items[-1]["id"] if has_more and items else None,
            "limit": limit,
        }

    async def bulk_save_urls(self, payload: ProductImageBulkUrls) -> dict:
        if not payload.urls:
            raise HTTPException(status_code=400, detail="No images provided")

        create_rows = [{"image": url, "order": 0} for url in payload.urls]
        try:
            await self.db.productimage.create_many(data=create_rows)
            await self.invalidate()
            return {"success": True, "count": len(create_rows)}
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=500, detail=str(e))

    async def _get_referenced_image_urls(self, urls: list[str]) -> set[str]:
        """URLs still referenced by order/cart history — must never be deleted
        from storage, even if their ProductImage row is being removed."""
        if not urls:
            return set()

        order_refs = await self.db.orderitem.find_many(
            where={"image": {"in": urls}}
        )
        cart_refs = await self.db.cartitem.find_many(
            where={"image": {"in": urls}}
        )
        return {r.image for r in order_refs if r.image} | {r.image for r in cart_refs if r.image}


    async def process_bulk_delete_task(self, payload: ImageBulkDelete, remove_storage_fn, delete_index_fn):
        images = await self.db.productimage.find_many(
            where={"id": {"in": payload.files}}, include={"product": True}
        )
        if not images:
            await self.ws_manager.broadcast_to_all({"status": "failed", "error": "No images found"}, "bulk_action")
            return

        try:
            product_ids = list({img.product_id for img in images if img.product_id})
            image_urls = [img.image for img in images if img.image]

            referenced = await self._get_referenced_image_urls(image_urls)
            safe_to_purge = [u for u in image_urls if u not in referenced]

            if referenced:
                logger.info(
                    f"Skipping storage deletion for {len(referenced)} image(s) "
                    f"still referenced by order/cart history: {referenced}"
                )

            await self.db.productimage.delete_many(where={"id": {"in": [img.id for img in images]}})

            storage_result, index_result = await asyncio.gather(
                remove_storage_fn(safe_to_purge),
                delete_index_fn(product_ids),
                return_exceptions=True,
            )

            if isinstance(storage_result, BaseException):
                logger.error(f"Storage cleanup task raised: {storage_result}")
            elif storage_result:
                logger.error(
                    f"{len(storage_result)} images deleted from DB but failed to "
                    f"remove from storage (now orphaned): {storage_result}"
                )

            if isinstance(index_result, Exception):
                logger.error(f"Search index delete failed: {index_result}")

            await self.ws_manager.broadcast_to_all({"status": "completed"}, "bulk_action")
        except Exception as e:
            logger.error(f"Error processing bulk delete: {str(e)}")
            await self.ws_manager.broadcast_to_all({"status": "failed", "error": str(e)}, "bulk_action")

    async def create_metadata(self, image_id: int, payload: ProductImageMetadata) -> int:
        self._validate_dynamic_variants(payload)
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
                    "options": Json(
                        [option.model_dump() for option in payload.options]
                        if payload.options is not None else []
                    ),
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
                            "attributes": Json(v.attributes or {}),
                        })
                    await asyncio.gather(*[_create_variant(v) for v in payload.variants])
                await self.cache_srv.invalidate(tags=["stats-trends", "products", f"product:{product.id}"])
                return product.id
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error creating product for image {image_id}: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def update_metadata(self, image_id: int, payload: ProductImageMetadata) -> int:
        self._validate_dynamic_variants(payload)
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
                if payload.options is not None:
                    update_data["options"] = Json(
                        [option.model_dump() for option in payload.options]
                    )

                if update_data:
                    await tx.product.update(where={"id": existing_image.product_id}, data=update_data)

                if payload.variants is not None:
                    existing_variants = await tx.productvariant.find_many(
                        where={"product_id": existing_image.product_id},
                    )
                    existing_ids = {existing.id for existing in existing_variants}
                    submitted_ids = {v.id for v in payload.variants if v.id is not None}
                    if not submitted_ids.issubset(existing_ids):
                        raise HTTPException(status_code=400, detail="A variant does not belong to this product")

                    # A combination submitted without an id may match a variant that was removed
                    # earlier (same attributes). Reuse that row instead of creating a duplicate.
                    removed_by_key = {}
                    for existing in existing_variants:
                        key = attributes_key(existing.attributes)
                        if key and existing.id not in submitted_ids:
                            removed_by_key.setdefault(key, existing)

                    kept_ids = set(submitted_ids)
                    targets = []
                    for v in payload.variants:
                        target_id = v.id
                        if target_id is None:
                            match = removed_by_key.get(attributes_key(v.attributes))
                            if match and match.id not in kept_ids:
                                target_id = match.id
                                kept_ids.add(match.id)
                        targets.append((target_id, v))

                    for existing in existing_variants:
                        if existing.id not in kept_ids:
                            # Keep historical cart/order foreign keys intact; retire removed combinations.
                            # They are hidden because their attributes no longer fit the product options.
                            await tx.productvariant.update(
                                where={"id": existing.id},
                                data={"inventory": 0, "status": "OUT_OF_STOCK"},
                            )

                    async def _upsert_variant(target_id, v):
                        v_data = {
                            "price": v.price, "old_price": v.old_price, "inventory": v.inventory,
                            "status": "IN_STOCK" if v.inventory > 0 else "OUT_OF_STOCK",
                        }
                        # The old size/color/width/length/age columns are being retired.
                        # Only write them when the caller actually sends them, so a save
                        # from the new form does not wipe existing values.
                        for legacy_field in ("size", "color", "width", "length", "age"):
                            legacy_value = getattr(v, legacy_field, None)
                            if legacy_value is not None:
                                v_data[legacy_field] = legacy_value
                        if v.attributes is not None:
                            v_data["attributes"] = Json(v.attributes or {})
                        if target_id:
                            await tx.productvariant.update(where={"id": target_id}, data=v_data)
                        else:
                            await tx.productvariant.create(data={
                                **v_data, "product_id": existing_image.product_id, "sku": generate_sku()
                            })
                    await asyncio.gather(*[_upsert_variant(target_id, v) for target_id, v in targets])

                await self.cache_srv.invalidate(tags=["products", f"product:{existing_image.product_id}"])
                return existing_image.product_id
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating image metadata {image_id}: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def _process_single_image(self, image, payload: ImagesBulkUpdate, product_ids: list) -> None:
        if image.product_id is None:
            name: str = f"{random.choice(['Classic', 'Premium', 'Superior', 'Deluxe', 'Luxury'])} {random.randint(10000, 99999)}"
            slug: str = slugify(name)
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
            product_ids.append(product.id)
        else:
            product_ids.append(image.product_id)
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

        await self.cache_srv.invalidate(tags=["stats-trends"])

    async def bulk_add_product_variants(self, payload: BulkAddProductVariants) -> dict[str, Any]:
        """Apply a shared variant structure while preserving matching variants per product."""
        names = [option.name.strip() for option in payload.options]
        if any(not name for name in names) or len({name.casefold() for name in names}) != len(names):
            raise HTTPException(status_code=400, detail="Attribute names must be non-empty and unique")

        option_values: dict[str, set[str]] = {}
        for option, name in zip(payload.options, names):
            values = [value.strip() for value in option.values]
            if not values or any(not value for value in values) or len(values) != len(set(values)):
                raise HTTPException(status_code=400, detail=f"Values for {name} must be non-empty and unique")
            option_values[name] = set(values)

        submitted: dict[tuple[tuple[str, str], ...], Any] = {}
        for variant in payload.variants:
            attrs = variant.attributes
            if set(attrs) != set(names) or any(value not in option_values[name] for name, value in attrs.items()):
                raise HTTPException(status_code=400, detail="Variant combinations do not match the configured attributes")
            key = tuple(sorted(attrs.items()))
            if key in submitted:
                raise HTTPException(status_code=400, detail="Duplicate variant combination")
            submitted[key] = variant

        expected_count = 1
        for values in option_values.values():
            expected_count *= len(values)
            if expected_count > 500:
                raise HTTPException(status_code=400, detail="A maximum of 500 variant combinations is allowed")
        if len(submitted) != expected_count:
            raise HTTPException(status_code=400, detail="Generate every combination for the configured attributes")

        product_ids = list(dict.fromkeys(payload.product_ids))
        products = await self.db.product.find_many(
            where={"id": {"in": product_ids}}, include={"variants": True}
        )
        products_by_id = {product.id: product for product in products}
        missing = [product_id for product_id in product_ids if product_id not in products_by_id]
        if missing:
            raise HTTPException(status_code=404, detail=f"Products not found: {missing}")

        try:
            async with self.db.tx(timeout=60000) as tx:
                for product_id in product_ids:
                    product = products_by_id[product_id]
                    existing_by_key = {}
                    for existing in product.variants or []:
                        attrs = existing.attributes or {}
                        if attrs:
                            existing_by_key[tuple(sorted(attrs.items()))] = existing

                    await tx.product.update(
                        where={"id": product_id},
                        data={"options": Json([option.model_dump() for option in payload.options])},
                    )
                    for key, value in submitted.items():
                        existing = existing_by_key.get(key)
                        if existing:
                            # Keep the product's own price, stock and variant ID for existing combinations.
                            await tx.productvariant.update(
                                where={"id": existing.id},
                                data={"attributes": Json(value.attributes)},
                            )
                        else:
                            await tx.productvariant.create(data={
                                "product_id": product_id,
                                "sku": generate_sku(),
                                "price": value.price,
                                "old_price": value.old_price or 0,
                                "inventory": value.inventory,
                                "status": "IN_STOCK" if value.inventory > 0 else "OUT_OF_STOCK",
                                "attributes": Json(value.attributes),
                            })

                    # Retire unmatched dynamic and legacy variants without breaking historical references.
                    matched_ids = {variant.id for key, variant in existing_by_key.items() if key in submitted}
                    for existing in product.variants or []:
                        if existing.id not in matched_ids:
                            await tx.productvariant.update(
                                where={"id": existing.id},
                                data={"inventory": 0, "status": "OUT_OF_STOCK"},
                            )
        except HTTPException:
            raise
        except Exception as exc:
            logger.exception("Bulk variant configuration failed")
            raise HTTPException(status_code=500, detail="Unable to apply variants to selected products") from exc

        await self.cache_srv.invalidate(tags=["products", "stats-trends", *[f"product:{pid}" for pid in product_ids]])
        await self.invalidate()
        return {"success": True, "updated_count": len(product_ids), "product_ids": product_ids}

    async def handle_bulk_update_images(self, payload: ImagesBulkUpdate, images, index_products_fn) -> None:
        failed_ids = []
        product_ids = []

        for image in images:
            try:
                await self._process_single_image(image, payload, product_ids)
            except Exception as e:
                logger.error(f"Error processing image {image.id}: {e}")
                failed_ids.append(image.id)

        await index_products_fn(product_ids=product_ids)
        status = "completed" if not failed_ids else "partial"
        await self.ws_manager.broadcast_to_all({
            "status": status, "failed_ids": failed_ids, "success_count": len(images) - len(failed_ids)
        }, "bulk_action")

    async def invalidate(self, tags: list[str] | None = None) -> None:
        """Invalidate gallery."""
        await self.cache_srv.invalidate(tags=["gallery"] + (tags or []))
