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
from app.services.cache import cacheable
from app.core.dependencies.product import ProductDep
from app.core.dependencies.gallery import GalleryDep

router = APIRouter()

@router.get("/")
@cacheable(key_prefix="gallery", tags=["gallery"])
async def image_gallery(
    request: Request,
    srv: GalleryDep,
    cursor: Optional[int] = Query(default=None),
    limit: int = Query(default=36, ge=1, le=100),
    sort: str = Query(default="newest", pattern="^(newest|oldest)$"),
    active: Optional[bool] = Query(default=None),
    out_of_stock: bool = Query(default=False),
    category_slug: Optional[str] = Query(default=None),
    name: Optional[str] = Query(default=None),
) -> PaginatedProductImages:
    """Image gallery endpoint using cursor-based pagination."""
    items = await srv.get_gallery_items(
        cursor=cursor, limit=limit, sort=sort, active=active, out_of_stock=out_of_stock,
        category_slug=category_slug, name=name,
    )
    return PaginatedProductImages.validate(items)


@router.delete("/{image_id}", dependencies=[Depends(require_admin)])
async def delete_gallery_image(
    image_id: int,
    srv: GalleryDep,
    product_srv: ProductDep,
    background_tasks: BackgroundTasks,
) -> Message:
    product_id, image_urls = await srv.delete_image(image_id)

    if not product_id:
        background_tasks.add_task(srv.storage.remove_images, image_urls[0])
        return Message(message="Image deleted successfully")

    background_tasks.add_task(product_srv.delete_product_index, product_ids=[product_id])
    background_tasks.add_task(srv.storage.remove_images, image_urls)
    return Message(message="Image and all related data deleted successfully")


@router.post("/bulk-upload", dependencies=[Depends(require_admin)])
async def bulk_save_image_urls(
    srv: GalleryDep,
    payload: ProductImageBulkUrls,
):
    return await srv.bulk_save_urls(payload)


@router.post("/bulk-delete", dependencies=[Depends(require_admin)])
async def bulk_delete_gallery_images(
    srv: GalleryDep,
    Product_srv: ProductDep,
    payload: ImageBulkDelete,
    background_tasks: BackgroundTasks,
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
    await srv.ws_manager.broadcast_to_all({"status": "processing"}, "bulk_action")
    return {"success": True, "message": f"Deleting {len(images)} images..."}


@router.post("/{image_id}/metadata", dependencies=[Depends(require_admin)])
async def create_image_metadata(
    image_id: int,
    srv: GalleryDep,
    payload: ProductImageMetadata,
    product_srv: ProductDep,
    background_tasks: BackgroundTasks,
):
    product_id = await srv.create_metadata(image_id, payload)
    background_tasks.add_task(product_srv.invalidate, id=product_id)
    return {"success": True}


@router.patch("/{image_id}/metadata", dependencies=[Depends(require_admin)])
async def update_image_metadata(
    image_id: int,
    srv: GalleryDep,
    payload: ProductImageMetadata,
    product_srv: ProductDep,
    background_tasks: BackgroundTasks,
):
    product_id = await srv.update_metadata(image_id, payload)
    background_tasks.add_task(product_srv.invalidate, id=product_id)
    return {"success": True}


@router.patch("/bulk-update", dependencies=[Depends(require_admin)])
async def bulk_update_products(
    srv: GalleryDep,
    product_srv: ProductDep,
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

    await srv.ws_manager.broadcast_to_all(
        data={"status": "processing", "total": len(images)}, message_type="bulk_action"
    )

    background_tasks.add_task(
        srv.handle_bulk_update_images,
        payload=payload,
        images=images,
        index_products_fn=product_srv.invalidate_all
    )

    return {"message": f"Updating {len(images)} products..."}
