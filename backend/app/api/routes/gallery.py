from typing import Any, Optional
import random
import asyncio

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
    BackgroundTasks,
    Request,
    Depends
)
from app.core.logging import get_logger
from app.core.utils import slugify, generate_sku
from app.models.generic import Message, ImageBulkDelete
from app.models.product import (
    ProductImageMetadata,
    ImagesBulkUpdate,
    ProductImageBulkUrls,
    ProductImage
)
from app.prisma_client import prisma as db
from app.services.product import index_products, delete_product_index, index_product
from app.services.redis import cache_response
from app.services.recently_viewed import RecentlyViewedService
from app.services.websocket import manager
from app.services.generic import remove_image_from_storage
from app.services.redis import invalidate_pattern, invalidate_keys
from app.models.gallery import PaginatedProductImages
from app.core.permissions import require_admin

logger = get_logger(__name__)


def build_variant_data(payload) -> dict[str, Any]:
    data = {}
    if payload.size is not None:
        data["size"] = payload.size
    if payload.color is not None:
        data["color"] = payload.color
    if payload.measurement is not None:
        data["measurement"] = payload.measurement
    if payload.age is not None:
        data["age"] = payload.age
    if payload.inventory is not None:
        data["inventory"] = payload.inventory
        data["status"] = "IN_STOCK" if payload.inventory > 0 else "OUT_OF_STOCK"
    if payload.price is not None:
        data["price"] = payload.price
    if payload.old_price is not None:
        data["old_price"] = payload.old_price
    return data


def build_relation_data(category_ids=None, collection_ids=None) -> dict[str, Any]:
    data: dict[str, Any] = {}
    if category_ids:
        data["categories"] = {"connect": [{"id": id} for id in category_ids]}
    if collection_ids:
        data["collections"] = {"connect": [{"id": id}
                                           for id in collection_ids]}
    return data

router = APIRouter()

@router.get("/")
@cache_response("gallery")
async def image_gallery(
    request: Request,
    cursor: Optional[int] = Query(default=None),
    limit: int = Query(default=36, ge=1, le=100),
) -> PaginatedProductImages:
    """
    Image gallery endpoint using cursor-based pagination.
    """
    try:
        images = await db.query_raw(
            """
            SELECT 
                pi.id,
                pi.image,
                pi."order",
                pi.product_id,
                p.id          AS p_id,
                p.name        AS p_name,
                p.slug        AS p_slug,
                p.active      AS p_active,
                p.is_new      AS p_is_new,
                -- variants as json array
                COALESCE(
                    JSON_AGG(
                        DISTINCT JSONB_BUILD_OBJECT(
                            'id', pv.id,
                            'sku', pv.sku,
                            'product_id', pv.product_id,
                            'price', pv.price,
                            'old_price', pv.old_price,
                            'inventory', pv.inventory,
                            'status', pv.status,
                            'size', pv.size,
                            'color', pv.color,
                            'measurement', pv.measurement,
                            'age', pv.age
                        )
                    ) FILTER (WHERE pv.id IS NOT NULL),
                    '[]'
                ) AS variants,
                -- categories as json array
                COALESCE(
                    JSON_AGG(
                        DISTINCT JSONB_BUILD_OBJECT(
                            'id', pc.id,
                            'name', pc.name,
                            'slug', pc.slug
                        )
                    ) FILTER (WHERE pc.id IS NOT NULL),
                    '[]'
                ) AS categories,
                -- collections as json array
                COALESCE(
                    JSON_AGG(
                        DISTINCT JSONB_BUILD_OBJECT(
                            'id', col.id,
                            'name', col.name,
                            'slug', col.slug
                        )
                    ) FILTER (WHERE col.id IS NOT NULL),
                    '[]'
                ) AS collections
            FROM "product_images" pi
            LEFT JOIN "products" p 
                ON p.id = pi.product_id
            LEFT JOIN "product_variants" pv 
                ON pv.product_id = p.id
            LEFT JOIN "_ProductCategories" cp 
                ON cp."B" = p.id
            LEFT JOIN "categories" pc 
                ON pc.id = cp."A"
            LEFT JOIN "_ProductCollections" clp 
                ON clp."B" = p.id
            LEFT JOIN "collections" col 
                ON col.id = clp."A"
            WHERE pi."order" = 0
            AND pi.id < $1
            GROUP BY pi.id, p.id
            ORDER BY pi.id DESC
            LIMIT $2
            """,
            cursor or 2147483647,
            limit + 1,
        )

        has_more: bool = len(images) > limit
        items = images[:limit]

        shaped = [
            {
                "id": img["id"],
                "image": img["image"],
                "order": img["order"],
                "product_id": img["product_id"],
                "product": {
                    "id": img["p_id"],
                    "name": img["p_name"],
                    "slug": img["p_slug"],
                    "active": img["p_active"],
                    "is_new": img["p_is_new"],
                    "categories": img["categories"],
                    "collections": img["collections"],
                    "variants": img["variants"],
                } if img["p_id"] else None,
            }
            for img in items
        ]

        result = {
            "items": shaped,
            "next_cursor": items[-1]["id"] if has_more and items else None,
            "limit": limit,
        }
        return result
    except Exception as e:
        logger.error(f"Gallery fetch error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reindex", dependencies=[Depends(require_admin)])
async def reindex_images(background_tasks: BackgroundTasks) -> Message:
    """
    Re-index all images in the db to Meilisearch.
    """
    try:
        await invalidate_pattern("gallery")
        background_tasks.add_task(index_products)
        return Message(message="Re-indexing task enqueued...........")
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


@router.delete("/{image_id}", dependencies=[Depends(require_admin)])
async def delete_gallery_image(image_id: int, background_tasks: BackgroundTasks) -> Message:
    image = await db.productimage.find_unique(where={"id": image_id})
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    if not image.product_id:
        await db.productimage.delete(where={"id": image_id})
        await invalidate_pattern("gallery")
        background_tasks.add_task(remove_image_from_storage, image.image)
        return Message(message="Image deleted successfully")

    product_id = image.product_id
    try:
        async with db.tx() as tx:
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

    await asyncio.gather(
        invalidate_pattern("gallery"),
        RecentlyViewedService().remove_product_from_all(product_id=product_id),
    )

    background_tasks.add_task(delete_product_index, product_ids=[product_id])
    background_tasks.add_task(remove_image_from_storage, image_urls)

    return Message(message="Image and all related data deleted successfully")


@router.post("/bulk-upload", dependencies=[Depends(require_admin)])
async def bulk_save_image_urls(payload: ProductImageBulkUrls, background_tasks: BackgroundTasks):
    """
    Save many image URLs into the gallery.
    """
    try:
        if not payload.urls:
            raise HTTPException(status_code=400, detail="No images provided")

        create_rows = []
        for idx, url in enumerate(payload.urls):
            create_rows.append({
                "image": url,
                "order": 0,
            })

        if not create_rows:
            raise HTTPException(
                status_code=400, detail="No valid images to save")

        await db.productimage.create_many(data=create_rows)
        await invalidate_pattern("gallery")

        return {"success": True, "count": len(create_rows)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/bulk-delete", dependencies=[Depends(require_admin)])
async def bulk_delete_gallery_images(
    payload: ImageBulkDelete,
    background_tasks: BackgroundTasks,
):
    if not payload.files:
        raise HTTPException(status_code=400, detail="No image IDs provided")

    images = await db.productimage.find_many(
        where={"id": {"in": payload.files}},
        include={"product": True}
    )

    if not images:
        raise HTTPException(status_code=404, detail="No images found")

    found_ids = {img.id for img in images}
    missing_ids = set(payload.files) - found_ids
    if missing_ids:
        logger.warning(f"Some images not found, skipping: {missing_ids}")

    async def _delete_task(images: list[ProductImage]) -> None:
        try:
            product_ids = list({img.product_id for img in images if img.product_id})
            results = await asyncio.gather(
                remove_image_from_storage([img.image for img in images]),
                delete_product_index(product_ids),
                return_exceptions=True,
            )

            errors = [r for r in results if isinstance(r, Exception)]
            if errors:
                logger.error(f"Some delete tasks failed: {errors}")

            await db.productimage.delete_many(
                where={"id": {"in": [img.id for img in images]}}
            )

            await invalidate_keys("gallery")
            await manager.broadcast_to_all(
                data={"status": "completed"},
                message_type="bulk_action"
            )

            logger.info(f"Bulk delete completed for {len(images)} images")

        except Exception as e:
            logger.error(f"Error processing bulk delete: {str(e)}")
            await manager.broadcast_to_all(
                data={"status": "failed", "error": str(e)},
                message_type="bulk_action"
            )

    background_tasks.add_task(_delete_task, images=images)
    await manager.broadcast_to_all(
        data={"status": "processing"},
        message_type="bulk_action"
    )

    return {
        "success": True,
        "message": f"Deleting {len(images)} images..."
    }


@router.post("/{image_id}/metadata", dependencies=[Depends(require_admin)])
async def create_image_metadata(
    image_id: int,
    payload: ProductImageMetadata,
    background_tasks: BackgroundTasks,
):
    if not payload.name:
        raise HTTPException(status_code=400, detail="Product name is required")

    existing_image = await db.productimage.find_unique(where={"id": image_id})
    if not existing_image:
        raise HTTPException(status_code=404, detail="Image not found")
    if existing_image.product_id is not None:
        raise HTTPException(status_code=400, detail="Image is already linked to a product")

    slugified_name: str = slugify(payload.name)
    conflict = await db.product.find_first(where={"slug": slugified_name})
    if conflict:
        raise HTTPException(status_code=400, detail="A product with this name already exists")

    try:
        async with db.tx() as tx:
            product_data: dict[str, Any] = {
                "name": payload.name,
                "slug": slugified_name,
                "sku": generate_sku(),
                "description": payload.description,
                "active": True,
                "is_new": payload.is_new if payload.is_new is not None else False,
            }

            if payload.category_ids:
                product_data["categories"] = {"connect": [{"id": id} for id in payload.category_ids]}
            if payload.collection_ids:
                product_data["collections"] = {"connect": [{"id": id} for id in payload.collection_ids]}

            product = await tx.product.create(data=product_data)

            await tx.productimage.update(
                where={"id": image_id},
                data={"product": {"connect": {"id": product.id}}}
            )

            async def _create_variant(variant) -> None:
                try:
                    await tx.productvariant.create(
                        data={
                            "sku": generate_sku(),
                            "price": variant.price,
                            "old_price": variant.old_price,
                            "inventory": variant.inventory,
                            "product_id": product.id,
                            "status": "IN_STOCK" if variant.inventory > 0 else "OUT_OF_STOCK",
                            "size": variant.size,
                            "color": variant.color,
                            "measurement": variant.measurement,
                            "age": variant.age,
                        }
                    )
                except Exception as e:
                    logger.error(f"Variant creation failed: {e}")
                    raise HTTPException(status_code=400, detail=f"Failed to create variant: {str(e)}")

            if payload.variants:
                await asyncio.gather(*[_create_variant(v) for v in payload.variants])

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating product for image {image_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    await invalidate_pattern("gallery")
    background_tasks.add_task(index_product, product_id=product.id)

    return {"success": True}


@router.patch("/{image_id}/metadata", dependencies=[Depends(require_admin)])
async def update_image_metadata(
    image_id: int,
    payload: ProductImageMetadata,
    background_tasks: BackgroundTasks,
):
    existing_image = await db.productimage.find_unique(where={"id": image_id})
    if not existing_image:
        raise HTTPException(status_code=404, detail="Image not found")

    if payload.name is not None:
        new_slug = slugify(payload.name)
        conflict = await db.product.find_first(where={
            "slug": new_slug,
            "id": {"not": existing_image.product_id}
        })
        if conflict:
            raise HTTPException(status_code=400, detail="A product with this name already exists")

    try:
        async with db.tx() as tx:
            update_data = {}

            if payload.name is not None:
                update_data["name"] = payload.name
                update_data["slug"] = slugify(payload.name)
            if payload.description is not None:
                update_data["description"] = payload.description
            if payload.category_ids is not None:
                update_data["categories"] = {"set": [{"id": id} for id in payload.category_ids]}
            if payload.collection_ids is not None:
                update_data["collections"] = {"set": [{"id": id} for id in payload.collection_ids]}
            if payload.active is not None:
                update_data["active"] = payload.active
            if payload.is_new is not None:
                update_data["is_new"] = payload.is_new

            if update_data:
                await tx.product.update(
                    where={"id": existing_image.product_id},
                    data=update_data,
                )

            async def _upsert_variant(variant):
                status = "IN_STOCK" if variant.inventory > 0 else "OUT_OF_STOCK"
                variant_data = {
                    "price": variant.price,
                    "old_price": variant.old_price,
                    "inventory": variant.inventory,
                    "status": status,
                    "size": variant.size,
                    "color": variant.color,
                    "measurement": variant.measurement,
                    "age": variant.age,
                }
                try:
                    if variant.id:
                        await tx.productvariant.update(where={"id": variant.id}, data=variant_data)
                    else:
                        await tx.productvariant.create(data={
                            **variant_data,
                            "product_id": existing_image.product_id,
                            "sku": generate_sku(),
                        })
                except Exception as e:
                    logger.error(f"Variant upsert failed: {e}")
                    raise HTTPException(status_code=400, detail=f"Failed to upsert variant: {str(e)}")

            if payload.variants:
                await asyncio.gather(*[_upsert_variant(v) for v in payload.variants])

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating image metadata {image_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    await invalidate_pattern("gallery")
    background_tasks.add_task(index_product, product_id=existing_image.product_id)

    return {"success": True}

async def _process_single_image(
    tx,
    image,
    payload: ImagesBulkUpdate,
    created_product_ids: list,
) -> None:
    if image.product_id is None:
        name: str = f"{random.choice(['Classic', 'Premium', 'Superior', 'Deluxe', 'Luxury'])} {random.randint(10000, 99999)}"
        slug: str = slugify(name)

        existing = await tx.product.find_first(where={"slug": slug})
        if existing:
            slug = f"{slug}-{generate_sku().lower()}"

        product_data: dict[str, Any] = {
            "name": name,
            "slug": slug,
            "sku": generate_sku(),
            "active": payload.data.active if payload.data.active is not None else True,
            "is_new": payload.data.is_new or False,
            **build_relation_data(payload.data.category_ids, payload.data.collection_ids),
        }
        product = await tx.product.create(data=product_data)
        created_product_ids.append(product.id)

        await tx.productimage.update(
            where={"id": image.id},
            data={"product": {"connect": {"id": product.id}}},
        )

        variant_data = {
            "sku": generate_sku(),
            "product_id": product.id,
            "price": payload.data.price or 1,
            "inventory": payload.data.inventory or 0,
            **build_variant_data(payload.data),
        }
        await tx.productvariant.create(data=variant_data)

    else:
        created_product_ids.append(image.product_id)
        relation_updates: dict[str, Any] = {}

        if payload.data.category_ids:
            relation_updates["categories"] = {"set": [{"id": id} for id in payload.data.category_ids]}
        if payload.data.collection_ids:
            relation_updates["collections"] = {"set": [{"id": id} for id in payload.data.collection_ids]}
        if payload.data.is_new is not None:
            relation_updates["is_new"] = payload.data.is_new
        if payload.data.active is not None:
            relation_updates["active"] = payload.data.active

        if relation_updates:
            await tx.product.update(where={"id": image.product_id}, data=relation_updates)

        variant_data = build_variant_data(payload.data)
        if variant_data and image.product and image.product.variants:
            await tx.productvariant.update(
                where={"id": image.product.variants[0].id},
                data=variant_data,
            )


async def handle_bulk_update_products(payload: ImagesBulkUpdate, images) -> None:
    failed_ids = []
    created_product_ids = []

    async def _process_with_tx(image):
        try:
            async with db.tx() as tx:
                await _process_single_image(tx, image, payload, created_product_ids)
        except Exception as e:
            logger.error(f"Error processing image {image.id}: {e}")
            failed_ids.append(image.id)

    await asyncio.gather(*[_process_with_tx(img) for img in images], return_exceptions=True)

    await invalidate_pattern("gallery")
    await index_products(product_ids=created_product_ids)

    status = "completed" if not failed_ids else "partial"
    await manager.broadcast_to_all(
        data={
            "status": status,
            "failed_ids": failed_ids,
            "success_count": len(images) - len(failed_ids),
        },
        message_type="bulk_action"
    )

    if failed_ids:
        logger.warning(f"Bulk update partial failure — failed image ids: {failed_ids}")
    else:
        logger.info(f"Bulk update completed for {len(images)} images")


@router.patch("/bulk-update", dependencies=[Depends(require_admin)])
async def bulk_update_products(
    payload: ImagesBulkUpdate,
    background_tasks: BackgroundTasks,
) -> Message:
    if not payload.image_ids:
        raise HTTPException(status_code=400, detail="No image IDs provided")

    images = await db.productimage.find_many(
        where={"id": {"in": payload.image_ids}},
        include={"product": {"include": {"variants": True}}},
    )

    if not images:
        raise HTTPException(status_code=404, detail="No images found")

    if len(images) != len(payload.image_ids):
        found_ids = {img.id for img in images}
        missing = set(payload.image_ids) - found_ids
        logger.warning(f"Some images not found, proceeding with found: {missing}")

    background_tasks.add_task(handle_bulk_update_products, payload, images)

    await manager.broadcast_to_all(
        data={"status": "processing", "total": len(images)},
        message_type="bulk_action"
    )

    return {"message": f"Updating {len(images)} products..."}
