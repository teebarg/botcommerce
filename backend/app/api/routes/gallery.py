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
from app.services.cache import cacheable
from app.core.dependencies.cache import CacheDep
from app.core.dependencies.product import ProductDep

router = APIRouter()

@router.get("/")
@cacheable(key_prefix="gallery", tags=["gallery"])
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
    cache: CacheDep,
    product_srv: ProductDep,
    background_tasks: BackgroundTasks,
    srv: GalleryService = Depends(get_gallery_service)
) -> Message:
    product_id, image_urls = await srv.delete_image(image_id)

    if not product_id:
        background_tasks.add_task(srv.storage.remove_images, image_urls[0])
        return Message(message="Image deleted successfully")

    background_tasks.add_task(product_srv.delete_product_index, product_ids=[product_id])
    background_tasks.add_task(srv.storage.remove_images, image_urls)
    await cache.invalidate(tags=["gallery"])
    return Message(message="Image and all related data deleted successfully")


@router.post("/bulk-upload", dependencies=[Depends(require_admin)])
async def bulk_save_image_urls(
    cache: CacheDep,
    payload: ProductImageBulkUrls,
    service: GalleryService = Depends(get_gallery_service)
):
    result = await service.bulk_save_urls(payload)
    await cache.invalidate(tags=["gallery"])
    return result


@router.post("/bulk-delete", dependencies=[Depends(require_admin)])
async def bulk_delete_gallery_images(
    cache: CacheDep,
    Product_srv: ProductDep,
    payload: ImageBulkDelete,
    background_tasks: BackgroundTasks,
    srv: GalleryService = Depends(get_gallery_service)
):
    if not payload.files:
        raise HTTPException(status_code=400, detail="No image IDs provided")

    images = await db.productimage.find_many(where={"id": {"in": payload.files}})
    if not images:
        raise HTTPException(status_code=404, detail="No images found")

    background_tasks.add_task(
        srv.process_bulk_delete_task,
        payload=payload,
        remove_storage_fn=srv.storage.remove_images,
        delete_index_fn=Product_srv.delete_product_index
    )
    await cache.invalidate(tags=["gallery"])

    await srv.ws_manager.broadcast_to_all({"status": "processing"}, "bulk_action")
    return {"success": True, "message": f"Deleting {len(images)} images..."}


@router.post("/{image_id}/metadata", dependencies=[Depends(require_admin)])
async def create_image_metadata(
    image_id: int,
    cache: CacheDep,
    payload: ProductImageMetadata,
    product_srv: ProductDep,
    background_tasks: BackgroundTasks,
    service: GalleryService = Depends(get_gallery_service)
):
    product_id = await service.create_metadata(image_id, payload)
    background_tasks.add_task(product_srv.invalidate, product_id=product_id)
    await cache.invalidate(tags=["gallery"])
    return {"success": True}


@router.patch("/{image_id}/metadata", dependencies=[Depends(require_admin)])
async def update_image_metadata(
    image_id: int,
    cache: CacheDep,
    payload: ProductImageMetadata,
    product_srv: ProductDep,
    background_tasks: BackgroundTasks,
    service: GalleryService = Depends(get_gallery_service)
):
    product_id = await service.update_metadata(image_id, payload)
    background_tasks.add_task(product_srv.invalidate, product_id=product_id)
    await cache.invalidate(tags=["gallery"])
    return {"success": True}


@router.patch("/bulk-update", dependencies=[Depends(require_admin)])
async def bulk_update_products(
    cache: CacheDep,
    product_srv: ProductDep,
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
        service.handle_bulk_update_images,
        payload=payload,
        images=images,
        index_products_fn=product_srv.invalidate_all
    )

    await cache.invalidate(tags=["gallery"])

    await service.ws_manager.broadcast_to_all(
        data={"status": "processing", "total": len(images)}, message_type="bulk_action"
    )
    return {"message": f"Updating {len(images)} products..."}
