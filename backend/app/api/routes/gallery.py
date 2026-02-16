from typing import Any, Optional
import random

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
from prisma.errors import UniqueViolationError
from app.services.product import index_images, reindex_image, delete_image_index
from app.services.redis import cache_response
from app.services.recently_viewed import RecentlyViewedService
from app.services.websocket import manager
from app.services.generic import remove_image_from_storage
from app.services.redis import invalidate_pattern
from app.core.deps import get_current_superuser

logger = get_logger(__name__)


async def process_bulk_delete_images(images: list[ProductImage]):
    """
    Process bulk deletion of gallery images.
    """
    try:
        await remove_image_from_storage([image.image for image in images])
        await delete_image_index(images)

        logger.info("Bulk delete completed successfully")

    except Exception as e:
        logger.error(f"Error processing bulk delete: {str(e)}")


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


async def handle_bulk_update_products(payload: ImagesBulkUpdate, images): 
    async with db.tx() as tx:
        for index, image in enumerate(images):
            try:
                if image.product_id is None:
                    name = f"{random.choice(['Classic', 'Premium', 'Superior', 'Deluxe', 'Luxury'])} {random.randint(10000, 99999)}"
                    product_data: dict[str, Any] = {
                        "name": name,
                        "slug": slugify(name),
                        "sku": generate_sku(),
                        "active": payload.data.active or True,
                        "is_new": payload.data.is_new or False,
                        **build_relation_data(payload.data.category_ids, payload.data.collection_ids),
                    }
                    product = await tx.product.create(data=product_data)

                    await tx.productimage.update(
                        where={"id": image.id},
                        data={"product": {"connect": {"id": product.id}}},
                    )

                    variant_data = {"sku": generate_sku(
                    ), "product_id": product.id, "price": payload.data.price or 1, "inventory": payload.data.inventory or 0, **build_variant_data(payload.data)}
                    await tx.productvariant.create(data=variant_data)

                else:
                    relation_updates: dict[str, Any] = {}
                    if payload.data.category_ids:
                        relation_updates["categories"] = {
                            "set": [{"id": id} for id in payload.data.category_ids]}
                    if payload.data.collection_ids:
                        relation_updates["collections"] = {
                            "set": [{"id": id} for id in payload.data.collection_ids]}
                    if payload.data.is_new is not None:
                        relation_updates["is_new"] = payload.data.is_new
                    if payload.data.active is not None:
                        relation_updates["active"] = payload.data.active

                    if relation_updates:
                        await tx.product.update(where={"id": image.product_id}, data=relation_updates)

                    variant_data = build_variant_data(payload.data)
                    if variant_data and image.product.variants:
                        await tx.productvariant.update(
                            where={"id": image.product.variants[0].id},
                            data=variant_data,
                        )
            except Exception as e:
                logger.error(f"Error processing image {image.id}: {e}")
                continue

    await invalidate_pattern("gallery")
    await manager.broadcast_to_all(
        data={"status": "completed"},
        message_type="bulk_action"
    )

    await reindex_image(image_ids=[image.id for image in images])

router = APIRouter()


@router.get("/")
@cache_response("gallery")
async def image_gallery(
    request: Request,
    cursor: Optional[int] = Query(default=None),
    limit: int = Query(default=40, le=100),
):
    """
    Gallery endpoint using cursor-based pagination.
    """
    try:
        where_clause = {
            "order": 0,
        }

        images = await db.productimage.find_many(
            where=where_clause,
            take=limit,
            skip=1 if cursor else 0,
            cursor={"id": cursor} if cursor else None,
            order={"id": "desc"},
            include={
                "product": {
                    "include": {
                        "categories": True,
                        "collections": True,
                        "variants": True,
                        "images": True,
                        "shared_collections": True,
                    }
                }
            },
        )

        return {
            "images": images,
            "next_cursor": images[-1].id if images else None,
        }

    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reindex", dependencies=[Depends(get_current_superuser)], response_model=Message)
async def reindex_images(background_tasks: BackgroundTasks):
    """
    Re-index all images in the db to Meilisearch.
    """
    try:
        await invalidate_pattern("gallery")
        background_tasks.add_task(index_images)
        return Message(message="Re-indexing task enqueued.")
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


@router.delete("/{image_id}", dependencies=[Depends(get_current_superuser)])
async def delete_gallery_image(image_id: int, background_tasks: BackgroundTasks) -> Message:
    """
    Delete a gallery image.
    If the image is linked to a product, delete the entire product
    """
    image = await db.productimage.find_unique(where={"id": image_id})
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    if not image.product_id:
        await db.productimage.delete(where={"id": image_id})
        await invalidate_pattern("gallery")
        background_tasks.add_task(delete_image_index, images=image)
        background_tasks.add_task(remove_image_from_storage, image.image)

        return Message(message="Image deleted successfully")

    async with db.tx() as tx:
        product_id = image.product_id

        images = await tx.productimage.find_many(where={"product_id": product_id})
        image_urls = [img.image for img in images]

        await tx.productimage.delete_many(where={"product_id": product_id})
        await tx.review.delete_many(where={"product_id": product_id})
        await tx.productvariant.delete_many(where={"product_id": product_id})
        await tx.product.delete(where={"id": product_id})

    service = RecentlyViewedService()
    await service.remove_product_from_all(product_id=product_id)

    await invalidate_pattern("gallery")
    background_tasks.add_task(delete_image_index, images=image)
    background_tasks.add_task(remove_image_from_storage, image_urls)

    return Message(message="Product and all related data deleted successfully")


@router.post("/bulk-upload", dependencies=[Depends(get_current_superuser)])
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
        background_tasks.add_task(index_images)

        return {"success": True, "count": len(create_rows)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/bulk-delete", dependencies=[Depends(get_current_superuser)])
async def bulk_delete_gallery_images(
    payload: ImageBulkDelete,
    background_tasks: BackgroundTasks,
):
    """
    Bulk delete gallery images.
    """
    try:
        if not payload.files:
            raise HTTPException(
                status_code=400, detail="No image IDs provided")

        images = await db.productimage.find_many(
            where={"id": {"in": payload.files}},
            include={"product": True}
        )

        if not images:
            raise HTTPException(status_code=404, detail="No images found")

        await db.productimage.delete_many(
            where={
                'id': {
                    'in': [image.id for image in images]
                }
            }
        )

        await invalidate_pattern("gallery")
        background_tasks.add_task(process_bulk_delete_images, images=images)
        await manager.broadcast_to_all(
            data={"status": "completed"},
            message_type="bulk_action"
        )

        return {
            "success": True,
            "message": "Bulk delete completed."
        }

    except Exception as e:
        logger.error(f"Error starting bulk delete job: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{image_id}/metadata", dependencies=[Depends(get_current_superuser)])
async def create_image_metadata(
    image_id: int,
    payload: ProductImageMetadata,
    background_tasks: BackgroundTasks,
):
    """
    Create a product, images and variants.
    """
    async with db.tx() as tx:
        try:
            slugified_name = slugify(payload.name)

            data: dict[str, Any] = {
                "name": payload.name,
                "slug": slugified_name,
                "sku": generate_sku(),
                "description": payload.description,
                "active": True,
                "is_new": payload.is_new if payload.is_new is not None else False,
            }

            if payload.category_ids:
                data["categories"] = {"connect": [{"id": id}
                                                  for id in payload.category_ids]}

            if payload.collection_ids:
                data["collections"] = {"connect": [{"id": id}
                                                   for id in payload.collection_ids]}

            product = await tx.product.create(data=data)

            await tx.productimage.update(
                where={"id": image_id},
                data={
                    "product": {"connect": {"id": product.id}}
                }
            )

            if payload.variants:
                for variant in payload.variants:
                    try:
                        await tx.productvariant.create(
                            data={
                                "sku": generate_sku(),
                                "price": variant.price,
                                "old_price": variant.old_price,
                                "inventory": variant.inventory,
                                "product_id": product.id,
                                "status": variant.inventory > 0 and "IN_STOCK" or "OUT_OF_STOCK",
                                "size": variant.size,
                                "color": variant.color,
                                "measurement": variant.measurement,
                                "age": variant.age,
                            }
                        )
                    except Exception as e:
                        logger.error(e)
                        raise HTTPException(
                            status_code=400, detail=f"Failed to create variant: {str(e)}")

            await invalidate_pattern("gallery")
            background_tasks.add_task(reindex_image, image_ids=[image_id])

            return {"success": True}
        except UniqueViolationError:
            raise HTTPException(
                status_code=400, detail="Product with this name already exists")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{image_id}/metadata", dependencies=[Depends(get_current_superuser)])
async def update_image_metadata(
    image_id: int,
    payload: ProductImageMetadata,
    background_tasks: BackgroundTasks,
):
    """
    - Updates product metadata
    - Creates or updates variants (if provided)
    """
    async with db.tx() as tx:
        try:
            existing_image = await db.productimage.find_unique(where={"id": image_id})
            if not existing_image:
                raise HTTPException(status_code=404, detail="Image not found")

            update_data = {}

            if payload.name is not None:
                update_data["name"] = payload.name
                update_data["slug"] = slugify(payload.name)

            if payload.description is not None:
                update_data["description"] = payload.description

            if payload.category_ids is not None:
                category_ids = [{"id": id} for id in payload.category_ids]
                update_data["categories"] = {"set": category_ids}

            if payload.collection_ids is not None:
                collection_ids = [{"id": id} for id in payload.collection_ids]
                update_data["collections"] = {"set": collection_ids}
            if payload.active is not None:
                update_data["active"] = payload.active
            if payload.is_new is not None:
                update_data["is_new"] = payload.is_new

            await tx.product.update(
                where={"id": existing_image.product_id},
                data=update_data,
            )

            for variant in payload.variants:
                try:
                    if variant.id:
                        await tx.productvariant.update(
                            where={
                                'id': variant.id
                            },
                            data={
                                'price': variant.price,
                                'old_price': variant.old_price,
                                'inventory': variant.inventory,
                                'status': variant.inventory > 0 and "IN_STOCK" or "OUT_OF_STOCK",
                                'size': variant.size,
                                'color': variant.color,
                                'measurement': variant.measurement,
                                'age': variant.age,
                            }
                        )
                    else:
                        await tx.productvariant.create(
                            data={
                                "product_id": existing_image.product_id,
                                'sku': generate_sku(),
                                'price': variant.price,
                                'old_price': variant.old_price,
                                'inventory': variant.inventory,
                                'status': variant.inventory > 0 and "IN_STOCK" or "OUT_OF_STOCK",
                                'size': variant.size,
                                'color': variant.color,
                                'measurement': variant.measurement,
                                'age': variant.age,
                            }
                        )
                except Exception as e:
                    logger.error(e)
                    raise HTTPException(
                        status_code=400, detail=f"Failed to create variant: {str(e)}")

            await invalidate_pattern("gallery")
            background_tasks.add_task(reindex_image, image_ids=[existing_image.id])

            return {"success": True}
        except UniqueViolationError:
            raise HTTPException(
                status_code=400, detail="Product with this name already exists")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=500, detail=str(e))


@router.patch("/bulk-update", dependencies=[Depends(get_current_superuser)])
async def bulk_update_products(payload: ImagesBulkUpdate, background_tasks: BackgroundTasks):
    images = await db.productimage.find_many(
        where={"id": {"in": payload.image_ids}},
        include={"product": {"include": {"variants": True}}},
    )

    if not images or len(images) != len(payload.image_ids):
        raise HTTPException(status_code=404, detail="Some images not found")

    background_tasks.add_task(handle_bulk_update_products, payload, images)

    return {"message": "Products update started"}
