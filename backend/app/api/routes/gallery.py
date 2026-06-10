from typing import Optional
from fastapi import APIRouter, HTTPException, Query, BackgroundTasks, Request, Depends

from app.models.generic import Message, ImageBulkDelete
from app.models.product import (
    ProductImageMetadata,
    ImagesBulkUpdate,
    ProductImageBulkUrls,
)
from app.models.gallery import PaginatedProductImages
from app.core.permissions import require_admin
from app.prisma_client import prisma as db
from app.core.dependencies.services import get_gallery_service
from app.services.gallery import GalleryService
from app.services.redis import cache_response, refresh_product
from app.services.product import index_products, delete_product_index, index_product
from app.services.generic import remove_image_from_storage

router = APIRouter()

@router.get("/")
@cache_response("gallery", tags=["gallery"])
async def image_gallery(
    request: Request,
    cursor: Optional[int] = Query(default=None),
    limit: int = Query(default=36, ge=1, le=100),
    sort: str = Query(default="newest", pattern="^(newest|oldest)$"),
    active: Optional[bool] = Query(default=None),
    out_of_stock: bool = Query(default=False),
    service: GalleryService = Depends(get_gallery_service)
) -> PaginatedProductImages:
    """Image gallery endpoint using cursor-based pagination."""
    return await service.get_gallery_items(
        cursor=cursor, limit=limit, sort=sort, active=active, out_of_stock=out_of_stock
    )


@router.delete("/{image_id}", dependencies=[Depends(require_admin)])
async def delete_gallery_image(
    image_id: int,
    background_tasks: BackgroundTasks,
    service: GalleryService = Depends(get_gallery_service)
) -> Message:
    product_id, image_urls = await service.delete_image(image_id)

    if not product_id:
        await refresh_product(tags=["gallery"])
        background_tasks.add_task(remove_image_from_storage, image_urls[0])
        return Message(message="Image deleted successfully")

    background_tasks.add_task(delete_product_index, product_ids=[product_id])
    background_tasks.add_task(remove_image_from_storage, image_urls)
    return Message(message="Image and all related data deleted successfully")


@router.post("/bulk-upload", dependencies=[Depends(require_admin)])
async def bulk_save_image_urls(
    payload: ProductImageBulkUrls,
    service: GalleryService = Depends(get_gallery_service)
):
    result = await service.bulk_save_urls(payload)
    await refresh_product(tags=["gallery"])
    return result


@router.post("/bulk-delete", dependencies=[Depends(require_admin)])
async def bulk_delete_gallery_images(
    payload: ImageBulkDelete,
    background_tasks: BackgroundTasks,
    service: GalleryService = Depends(get_gallery_service)
):
    if not payload.files:
        raise HTTPException(status_code=400, detail="No image IDs provided")

    images = await db.productimage.find_many(where={"id": {"in": payload.files}})
    if not images:
        raise HTTPException(status_code=404, detail="No images found")

    background_tasks.add_task(
        service.process_bulk_delete_task,
        payload=payload,
        remove_storage_fn=remove_image_from_storage,
        delete_index_fn=delete_product_index
    )

    await service.ws_manager.broadcast_to_all({"status": "processing"}, "bulk_action")
    return {"success": True, "message": f"Deleting {len(images)} images..."}


@router.post("/{image_id}/metadata", dependencies=[Depends(require_admin)])
async def create_image_metadata(
    image_id: int,
    payload: ProductImageMetadata,
    background_tasks: BackgroundTasks,
    service: GalleryService = Depends(get_gallery_service)
):
    product_id = await service.create_metadata(image_id, payload)
    background_tasks.add_task(index_product, product_id=product_id)
    return {"success": True}


@router.patch("/{image_id}/metadata", dependencies=[Depends(require_admin)])
async def update_image_metadata(
    image_id: int,
    payload: ProductImageMetadata,
    background_tasks: BackgroundTasks,
    service: GalleryService = Depends(get_gallery_service)
):
    product_id = await service.update_metadata(image_id, payload)
    background_tasks.add_task(index_product, product_id=product_id)
    return {"success": True}


@router.patch("/bulk-update", dependencies=[Depends(require_admin)])
async def bulk_update_products(
    payload: ImagesBulkUpdate,
    background_tasks: BackgroundTasks,
    service: GalleryService = Depends(get_gallery_service)
) -> Message:
    if not payload.image_ids:
        raise HTTPException(status_code=400, detail="No image IDs provided")

    images = await db.productimage.find_many(
        where={"id": {"in": payload.image_ids}},
        include={"product": {"include": {"variants": True}}},
    )
    if not images:
        raise HTTPException(status_code=404, detail="No images found")

    background_tasks.add_task(
        service.handle_bulk_update_products,
        payload=payload,
        images=images,
        index_products_fn=index_products
    )

    await service.ws_manager.broadcast_to_all(
        data={"status": "processing", "total": len(images)}, message_type="bulk_action"
    )
    return {"message": f"Updating {len(images)} products..."}
