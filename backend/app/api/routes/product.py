import uuid
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query, BackgroundTasks, Response, Request
from app.core.config import settings
from app.core.logging import get_logger
from app.core.dependencies.product import ProductDep, SearchDep
from app.services.cache import cacheable, DEFAULT_EXPIRATION
from app.core.deps import CurrentUser, UserDep
from app.models.generic import Message, ImageUpload
from app.models.product import ProductLite, VariantWithStatus, SearchProducts, FeedProducts, IndexProducts, ReviewStatus
from app.core.permissions import require_admin
from app.lib.cache import set_public_cache
from app.core.dependencies.services import StorageDep
from app.prisma_client import DbDep
from app.core.security import verify_extension_secret
from app.services.storage import MediaStorageService, StorageProvider

logger = get_logger(__name__)

router = APIRouter()

@router.get("/google-merchant-feed.xml")
async def get_google_merchant_feed(request: Request, srv: ProductDep, target: str = "google") -> Response:
    xml_content = await srv.generate_merchant_feed_xml(request=request, target=target)
    return Response(content=xml_content, media_type="application/xml")


@router.get("/{product_id}/review-status")
@cacheable(key_prefix="review-status", key_builder=lambda product_id: product_id)
async def get_review_status(request: Request, product_id: int, user: UserDep, srv: ProductDep) -> ReviewStatus:
    if not user:
        return ReviewStatus(has_purchased=False, has_reviewed=False)

    has_purchased, has_reviewed = await srv.check_review_status(user.id, product_id)
    return ReviewStatus(has_purchased=has_purchased, has_reviewed=has_reviewed)


@router.get("/{id}/similar")
@cacheable(key_prefix="similar", tags=lambda id: ["products"])
async def recommend(request: Request, srv: ProductDep, id: int, limit: int = Query(default=20, le=100)):
    items = await srv.get_similar_products(product_id=id, limit=limit)
    return {"similar": items}


@router.get("/recommend")
@cacheable(key_prefix="products:recommendation", tags=["products"])
async def get_recommendations(
    request: Request, srv: ProductDep, user: CurrentUser, limit: int = Query(default=20, le=100),
):
    items = await srv.get_personalized_recommendations(user_id=user.id, limit=limit)
    return {"recommended": items}


@router.get("/feed")
@cacheable(key_prefix="products:list", tags=["products"], cdn_ttl=600, cdn_swr=60)
async def feed(
    request: Request, srv: ProductDep, search: str = "", sort: str = "id:desc",
    cat_ids: str = Query(default=""), collections: str = Query(default=""),
    max_price: int = Query(default=50000, gt=0), min_price: int = Query(default=1, gt=0),
    sizes: str = Query(default=""), ages: str = Query(default=""),
    width: str = Query(default=""), length: str = Query(default=""),
    limit: int = Query(default=40, le=100), active: bool = Query(default=True),
    cursor: Optional[str] = Query(default=None),
) -> FeedProducts:
    return await srv.get_discovery_feed(
        search=search, sort=sort, cat_ids=cat_ids, collections=collections,
        max_price=max_price, min_price=min_price, sizes=sizes, ages=ages, width=width, length=length, limit=limit, active=active, cursor=cursor
    )


@router.get("/index-products")
@cacheable(key_prefix="products", key_builder="collections", tags=["products"], cdn_ttl=600, cdn_swr=60)
async def get_index_products(request: Request, srv: ProductDep) -> IndexProducts:
    return await srv.query_collection_index()


@router.get("/")
@cacheable(key_prefix="products:search", tags=["products"], cdn_ttl=600, cdn_swr=60)
async def search(
    request: Request, srv: ProductDep, search: str = "",
    collections: str = Query(default=""),
    skip: int = Query(default=0, ge=0), limit: int = Query(default=20, le=100),
) -> SearchProducts:
    res = await srv.get_discovery_feed(
        search=search, sort="id:desc", collections=collections,
        limit=limit, cursor=None, skip_offset=skip
    )

    total_count = res["total_count"]
    total_pages = (total_count // limit) + (total_count % limit > 0)

    return {
        "products": res["products"], "skip": skip,
        "limit": limit, "total_count": total_count, "total_pages": total_pages
    }


@router.get("/{slug}")
async def read(request: Request, slug: str, srv: ProductDep) -> ProductLite:
    set_public_cache(request, edge_ttl=86400, swr=600)
    cache_key: str = f"product:{slug}"
    cached = await srv.cache_srv.redis.get(cache_key)
    if cached:
        return json.loads(cached)

    product = await srv.get_by_slug(slug=slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    new_product = ProductLite.validate(product)
    await srv.cache_srv.set_with_tags(
        key=cache_key,
        value=new_product,
        expire=DEFAULT_EXPIRATION,
        tags=[f"product:{product.id}"],
    )

    return new_product


@router.put("/variants/{variant_id}", dependencies=[Depends(require_admin)])
async def update_variant(
    variant_id: int, variant: VariantWithStatus, srv: ProductDep,
):
    existing_variant = await srv.get_variant(variant_id=variant_id)
    if not existing_variant:
        raise HTTPException(status_code=404, detail="Variant not found")

    update_fields = ["price", "old_price", "inventory", "size", "color", "width", "length", "age"]
    update_data = {f: getattr(variant, f) for f in update_fields if getattr(variant, f, None) is not None}

    if "inventory" in update_data:
        update_data["status"] = "IN_STOCK" if update_data["inventory"] > 0 else "OUT_OF_STOCK"

    try:
        updated_variant = await srv.update_variant(variant_id=variant_id, update_data=update_data)
        await srv.invalidate(id=existing_variant.product_id)
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e))

    return updated_variant


@router.post("/configure-filterable-attributes")
async def configure_filterable_attributes(search_srv: SearchDep) -> Message:
    try:
        search_srv.update_settings()
        return Message(message="Filterable attributes updated successfully.")
    except Exception as e:
        logger.error(f"Error updating attributes: {e}")
        raise HTTPException(status_code=500, detail="Configuration task error.")


@router.get("/search/clear-index", dependencies=[Depends(require_admin)])
async def config_clear_index(search_srv: SearchDep):
    try:
        await search_srv.clear_index(settings.MEILI_PRODUCTS_INDEX)
        return {"message": "Index cleared"}
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search/delete-index", dependencies=[Depends(require_admin)])
async def config_delete_index(index_name: str, search_srv: SearchDep):
    try:
        search_srv.delete_index(index_name)
        return {"message": "Index dropped"}
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reindex")
async def reindex_products(srv: ProductDep, background_tasks: BackgroundTasks) -> Message:
    try:
        background_tasks.add_task(srv.invalidate_all)
        return Message(message="Re-indexing task enqueued...........")
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{id}/image-upload", dependencies=[Depends(verify_extension_secret)])
async def upload_image(id: int, db: DbDep, image_data: ImageUpload, srv: ProductDep, storage_srv: StorageDep, background_tasks: BackgroundTasks) -> Message:
    try:
        product = await srv.get(id=id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        image_url: str = storage_srv.upload(bucket="images", data=image_data)
        await db.productimage.create(
            data={"image": image_url, "product_id": id}
        )
        background_tasks.add_task(srv.invalidate, id=id)
        return Message(message="Image uploaded")
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024  # 8MB per image


@router.post("/{product_id}/images")
async def upload_product_images(
    db: DbDep,
    srv: ProductDep,
    storage: StorageDep,
    product_id: int,
    files: List[UploadFile] = File(...),
    provider: Optional[StorageProvider] = Query(
        default=None, description="Storage provider override: 'supabase' or 'r2'"
    ),
):
    product = await srv.get(id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    # Continue ordering after whatever images already exist for this product.
    existing_count = await db.productimage.count(where={"product_id": product_id})
    next_order = existing_count + 1

    created_images = []
    uploaded_for_rollback: List[tuple[str, str]] = []  # (bucket, filename) in case we need to clean up

    try:
        for idx, upload in enumerate(files):
            if upload.content_type not in ALLOWED_CONTENT_TYPES:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported file type: {upload.content_type} ({upload.filename})",
                )

            file_bytes = await upload.read()

            if len(file_bytes) > MAX_FILE_SIZE_BYTES:
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large: {upload.filename} (max {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB)",
                )

            file_extension = (upload.filename or "").split(".")[-1] or "jpg"
            unique_suffix = uuid.uuid4().hex[:8]
            unique_filename = f"products/{product_id}/{product.slug}-{next_order + idx}-{unique_suffix}.{file_extension}"

            image_url: str = storage.upload_file(
                bucket=settings.STORAGE_BUCKET,
                filename=unique_filename,
                bytes_data=file_bytes,
                content_type=upload.content_type,
                provider=provider,
            )
            uploaded_for_rollback.append((settings.STORAGE_BUCKET, unique_filename))

            record = await db.productimage.create(
                data={
                    "image": image_url,
                    "product_id": product_id,
                    "order": next_order + idx,
                }
            )
            created_images.append(record)

        await srv.invalidate(id=product_id)

        return {"product_id": product_id, "images": created_images}

    except HTTPException:
        for bucket, filename in uploaded_for_rollback:
            try:
                storage.delete_file(bucket, filename, provider=provider)
            except Exception as cleanup_err:
                logger.error(f"Rollback cleanup failed for {filename}: {cleanup_err}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error uploading product images: {e}")
        for bucket, filename in uploaded_for_rollback:
            try:
                storage.delete_file(bucket, filename, provider=provider)
            except Exception as cleanup_err:
                logger.error(f"Rollback cleanup failed for {filename}: {cleanup_err}")
        raise HTTPException(status_code=500, detail="Failed to upload product images") from e
