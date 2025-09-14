from typing import Any
import random

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    BackgroundTasks,
    Request
)
from app.core.deps import (
    CurrentUser,
    get_current_user,
    supabase,
)
from app.core.logging import get_logger
from app.core.utils import slugify, url_to_list, generate_sku
from app.models.generic import Message, ImageUpload, ImageBulkDelete
from app.models.product import (
    ProductCreate,
    ProductUpdate,
    VariantWithStatus,
    Product, SearchProducts, SearchProduct,
    ProductCreateBundle,
    ProductBulkImages,
    ProductImageMetadata,
    ImagesBulkUpdate
)
from app.services.meilisearch import (
    clear_index,
    delete_index,
    get_or_create_index,
    ensure_index_ready,
    REQUIRED_FILTERABLES,
    REQUIRED_SORTABLES
)
from app.prisma_client import prisma as db
from math import ceil
from app.core.storage import upload
from app.core.config import settings
from prisma.errors import UniqueViolationError
from app.services.product import index_products, reindex_product, product_upload, product_export, sync_index_product
from app.services.redis import cache_response, invalidate_list, invalidate_pattern
from meilisearch.errors import MeilisearchApiError
from app.services.popular_products import PopularProductsService
from app.services.recently_viewed import RecentlyViewedService
from app.services.websocket import manager
from app.core.storage import upload

logger = get_logger(__name__)


async def process_image_uploads_background(images: list):
    """
    Process image uploads.
    """
    logger.info(f"Starting image upload processing...")

    try:
        created_images = []
        failed_uploads = []

        for index, img_data in enumerate(images):
            await manager.broadcast_to_all(
                data={
                    "status": "processing",
                    "percent": (index + 1) / len(images) * 100,
                },
                message_type="image_upload"
            )
            try:
                image_url = upload(bucket="product-images", data=img_data)
                created_images.append({
                    "image": image_url,
                    "order": 0,
                })
                logger.info(
                    f"Successfully uploaded image {index + 1}/{len(images)}")
            except Exception as e:
                logger.error(f"Failed to upload image {index + 1}: {str(e)}")
                failed_uploads.append({
                    "index": index,
                    "error": str(e)
                })

        if created_images:
            await db.productimage.create_many(data=created_images)
            logger.info(f"Saved {len(created_images)} images to database")

        await invalidate_pattern("products:gallery")

        await manager.broadcast_to_all(
            data={
                "status": "completed",
            },
            message_type="image_upload"
        )

        logger.info(f"Image upload completed successfully")

    except Exception as e:
        logger.error(f"Error processing image upload job: {str(e)}")
        await manager.broadcast_to_all(
            data={
                "status": "failed",
            },
            message_type="image_upload"
        )


async def process_bulk_delete_images(image_ids: list[int], images: list):
    """
    Process bulk deletion of gallery images.
    """
    logger.info(
        f"Starting bulk delete processing for {len(image_ids)} images...")

    try:
        deleted_count = 0
        failed_deletions = []
        products_to_reindex = set()

        for index, image in enumerate(images):
            try:
                await manager.broadcast_to_all(
                    data={
                        "status": "processing",
                        "percent": (index + 1) / len(images) * 100
                    },
                    message_type="product_bulk_delete"
                )

                # Delete from storage if image exists
                if image.image and "/storage/v1/object/public/product-images/" in image.image:
                    try:
                        file_path = image.image.split(
                            "/storage/v1/object/public/product-images/")[1]
                        supabase.storage.from_(
                            "product-images").remove([file_path])
                    except Exception as storage_error:
                        logger.warning(
                            f"Failed to delete from storage: {storage_error}")

                await db.productimage.delete(where={"id": image.id})
                deleted_count += 1

                if image.product_id:
                    products_to_reindex.add(image.product_id)

                logger.info(
                    f"Successfully deleted image {index + 1}/{len(images)}")

            except Exception as e:
                logger.error(f"Failed to delete image {index + 1}: {str(e)}")
                failed_deletions.append({
                    "image_id": image.id,
                    "error": str(e)
                })

        for product_id in products_to_reindex:
            try:
                await reindex_product(product_id=product_id)
            except Exception as e:
                logger.error(
                    f"Failed to reindex product {product_id}: {str(e)}")

        # Invalidate cache
        await invalidate_pattern("products:gallery")

        # Broadcast completion status
        await manager.broadcast_to_all(
            data={
                "status": "completed",
            },
            message_type="product_bulk_delete"
        )

        logger.info(
            f"Bulk delete completed successfully. {deleted_count} deleted, {len(failed_deletions)} failed.")

    except Exception as e:
        logger.error(f"Error processing bulk delete: {str(e)}")
        await manager.broadcast_to_all(
            data={
                "status": "failed",
            },
            message_type="product_bulk_delete"
        )


def build_variant_data(payload) -> dict[str, Any]:
    data = {}
    if payload.size is not None:
        data["size"] = payload.size
    if payload.color is not None:
        data["color"] = payload.color
    if payload.measurement is not None:
        data["measurement"] = payload.measurement
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
        data["collections"] = {"connect": [{"id": id} for id in collection_ids]}
    return data


async def handle_bulk_update_products(payload: ImagesBulkUpdate, images):
    product_to_reindex: list[int] = []

    async with db.tx() as tx:
        for index, image in enumerate(images):
            await manager.broadcast_to_all(
                data={
                    "status": "processing",
                    "percent": (index + 1) / len(images) * 100,
                },
                message_type="product_bulk_update"
            )
            if image.product_id is None:
                name = f"{random.choice(['Classic','Premium','Superior','Deluxe','Luxury'])} {random.randint(100, 999)}"
                product_data: dict[str, Any] = {
                    "name": name,
                    "slug": slugify(name),
                    "sku": generate_sku(),
                    "active": payload.data.active,
                    **build_relation_data(payload.data.category_ids, payload.data.collection_ids),
                }
                product = await tx.product.create(data=product_data)

                await tx.productimage.update(
                    where={"id": image.id},
                    data={"product": {"connect": {"id": product.id}}},
                )

                variant_data = {"sku": generate_sku(), "product_id": product.id, **build_variant_data(payload.data)}
                await tx.productvariant.create(data=variant_data)

                product_to_reindex.append(product.id)

            else:
                relation_updates: dict[str, Any] = {}
                if payload.data.category_ids:
                    relation_updates["categories"] = {"set": [{"id": id} for id in payload.data.category_ids]}
                if payload.data.collection_ids:
                    relation_updates["collections"] = {"set": [{"id": id} for id in payload.data.collection_ids]}

                if relation_updates:
                    await tx.product.update(where={"id": image.product_id}, data=relation_updates)

                variant_data = build_variant_data(payload.data)
                if variant_data and image.product.variants:
                    await tx.productvariant.update(
                        where={"id": image.product.variants[0].id},
                        data=variant_data,
                    )

                product_to_reindex.append(image.product_id)

    await manager.broadcast_to_all(
        data={
            "status": "completed",
        },
        message_type="product_bulk_update"
    )

    # enqueue reindex in bulk
    for product_id in set(product_to_reindex):
        await reindex_product(product_id=product_id)


router = APIRouter()


@router.get("/popular")
async def get_popular_products(
    limit: int = Query(default=10, le=20)
) -> list[SearchProduct]:
    """Get popular products."""
    service = PopularProductsService()
    products = await service.get_popular_products(limit)
    return products


@router.get("/gallery")
@cache_response("products:gallery")
async def image_gallery(request: Request, skip: int = Query(default=0), limit: int = Query(default=10)):
    """
    Upload one or more product images.
    """
    try:
        where_clause = {
            "order": 0,
        }
        images = await db.productimage.find_many(
            where=where_clause,
            skip=skip,
            take=limit,
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
        total = await db.productimage.count(where=where_clause)
        return {
            "images": images,
            "skip": skip,
            "limit": limit,
            "total_pages": ceil(total/limit),
            "total_count": total,
        }
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/export")
async def export_products(
    current_user: CurrentUser,
    background_tasks: BackgroundTasks,
) -> Any:
    try:
        background_tasks.add_task(
            product_export, email=current_user.email, user_id=current_user.id)

        return {
            "message": "Data Export successful. Please check your email"
        }
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/search/public")
@cache_response("products")
async def public_search(
    request: Request,
    q: str = "",
    sort: str = "created_at:desc",
    categories: str = Query(default=""),
    collections: str = Query(default=""),
    max_price: int = Query(default=1000000, gt=0),
    min_price: int = Query(default=1, gt=0),
    sizes: str = Query(default=""),
    colors: str = Query(default=""),
    limit: int = Query(default=20, le=100),
    active: bool = Query(default=True),
) -> list[SearchProduct]:
    """
    Retrieve products using Meilisearch, sorted by latest.
    """
    filters = []
    if categories:
        filters.append(f"category_slugs IN {url_to_list(categories)}")
    if collections:
        filters.append(f"collection_slugs IN [{collections}]")
    if min_price and max_price:
        filters.append(
            f"min_variant_price >= {min_price} AND max_variant_price <= {max_price}")
    if sizes:
        filters.append(f"sizes IN [{sizes}]")
    if colors:
        filters.append(f"colors IN [{colors}]")
    filters.append(f"active = {active}")

    search_params = {
        "limit": limit,
        "sort": [sort],
    }

    if filters:
        search_params["filter"] = " AND ".join(filters)

    index = get_or_create_index(settings.MEILI_PRODUCTS_INDEX)

    try:
        search_results = index.search(
            q,
            {
                **search_params
            }
        )
    except MeilisearchApiError as e:
        error_code = getattr(e, "code", None)
        if error_code in {"invalid_search_facets", "invalid_search_filter", "invalid_search_sort"}:
            logger.warning(
                f"Invalid filter detected, attempting to auto-configure filterable attributes: {e}")

            ensure_index_ready(index)

            retry_results = index.search(
                q,
                {
                    **search_params
                }
            )
            return retry_results["hits"]

        logger.error(f"Meilisearch error: {e}")
        raise HTTPException(
            status_code=502, detail="Search service temporarily unavailable")
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400,
            detail=e.message
        )

    return search_results["hits"]


@router.get("/")
@cache_response("products")
async def search(
    request: Request,
    search: str = "",
    sort: str = "created_at:desc",
    categories: str = Query(default=""),
    collections: str = Query(default=""),
    max_price: int = Query(default=1000000, gt=0),
    min_price: int = Query(default=1, gt=0),
    sizes: str = Query(default=""),
    colors: str = Query(default=""),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, le=100),
    active: bool = Query(default=True),
    show_suggestions: bool = Query(default=False),
    show_facets: bool = Query(default=False),
) -> SearchProducts:
    """
    Retrieve products using Meilisearch, sorted by latest.
    """
    filters = []
    # if brand_id:
    #     brands = brand_id.split(",")
    #     filters.append(" OR ".join([f'brand = "{brand}"' for brand in brands]))
    if categories:
        filters.append(f"category_slugs IN {url_to_list(categories)}")
    if collections:
        filters.append(f"collection_slugs IN [{collections}]")
    if min_price and max_price:
        filters.append(
            f"min_variant_price >= {min_price} AND max_variant_price <= {max_price}")
    filters.append(f"active = {active}")
    if sizes:
        filters.append(f"sizes IN [{sizes}]")
    if colors:
        filters.append(f"colors IN [{colors}]")

    search_params = {
        "limit": limit,
        "offset": skip,
        "sort": [sort],
    }

    if show_facets:
        search_params["facets"] = ["category_slugs",
                                   "collection_slugs", "sizes", "colors"]

    if filters:
        search_params["filter"] = " AND ".join(filters)

    index = get_or_create_index(settings.MEILI_PRODUCTS_INDEX)
    try:
        search_results = index.search(
            search,
            {
                **search_params
            }
        )
        suggestions = []
        if show_suggestions:
            suggestions_raw = index.search(
                search,
                {
                    "limit": 4,
                    "attributesToRetrieve": ["name"],
                    "matchingStrategy": "all"
                }
            )
            suggestions = list(
                {hit["name"] for hit in suggestions_raw["hits"] if "name" in hit})

    except MeilisearchApiError as e:
        error_code = getattr(e, "code", None)
        if error_code in {"invalid_search_facets", "invalid_search_filter", "invalid_search_sort"}:
            logger.warning(
                f"Invalid filter detected, attempting to auto-configure filterable attributes: {e}")

            ensure_index_ready(index)

            search_results = index.search(
                search,
                {
                    **search_params
                }
            )
            suggestions = []
            if show_suggestions:
                suggestions_raw = index.search(
                    search,
                    {
                        "limit": 4,
                        "attributesToRetrieve": ["name"],
                        "matchingStrategy": "all"
                    }
                )
                suggestions = list(
                    {hit["name"] for hit in suggestions_raw["hits"] if "name" in hit})

        logger.error(f"Meilisearch error: {e}")
        raise HTTPException(
            status_code=502, detail="Search service temporarily unavailable")
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400,
            detail=e.message
        )

    total_count = search_results["estimatedTotalHits"]
    total_pages = (total_count // limit) + (total_count % limit > 0)

    return {
        "products": search_results["hits"],
        "facets": search_results.get("facetDistribution", {}),
        "skip": skip,
        "limit": limit,
        "total_count": total_count,
        "total_pages": total_pages,
        "suggestions": suggestions,
    }


@router.post("/")
async def create_product(product: ProductCreate, background_tasks: BackgroundTasks):
    slugified_name = slugify(product.name)

    data = {
        "name": product.name,
        "slug": slugified_name,
        "sku": generate_sku(),
        "description": product.description,
        # "brand": {"connect": {"id": product.brand_id}},
        "active": product.active,
    }

    if product.category_ids:
        category_connect = [{"id": id} for id in product.category_ids]
        data["categories"] = {"connect": category_connect}

    if product.collection_ids:
        collection_connect = [{"id": id} for id in product.collection_ids]
        data["collections"] = {"connect": collection_connect}

    if product.tags_ids:
        tag_connect = [{"id": id} for id in product.tags_ids]
        data["tags"] = {"connect": tag_connect}

    try:
        created_product = await db.product.create(data=data)
    except UniqueViolationError as e:
        logger.error(e)
        raise HTTPException(
            status_code=400, detail="Product with this name already exists")

    background_tasks.add_task(reindex_product, product_id=created_product.id)

    return created_product


@router.post("/create-bundle")
async def create_product_bundle(
    payload: ProductCreateBundle,
    background_tasks: BackgroundTasks,
):
    """
    Create a product, images and variants.
    - Creates the product with provided relations
    - Uploads additional images to Supabase (if provided)
    - Creates variants (if provided)
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
            }

            # if payload.brand_id is not None:
            #     data["brand"] = {"connect": {"id": payload.brand_id}}

            if payload.category_ids:
                data["categories"] = {"connect": [{"id": id}
                                                  for id in payload.category_ids]}

            if payload.collection_ids:
                data["collections"] = {"connect": [{"id": id}
                                                   for id in payload.collection_ids]}

            if payload.tags_ids:
                data["tags"] = {"connect": [{"id": id}
                                            for id in payload.tags_ids]}

            product = await tx.product.create(data=data)

            if payload.images:
                created_images = []
                for index, img in enumerate(payload.images):
                    try:
                        image_url = upload(bucket="product-images", data=img)
                        created_images.append({
                            "image": image_url,
                            "product_id": product.id,
                            "order": index,
                        })
                    except Exception as e:
                        logger.error(e)
                        raise HTTPException(
                            status_code=400, detail=f"Failed to upload image {index + 1}: {str(e)}")

                if created_images:
                    await tx.productimage.create_many(data=created_images)

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
                            }
                        )
                    except Exception as e:
                        logger.error(e)
                        raise HTTPException(
                            status_code=400, detail=f"Failed to create variant: {str(e)}")

            background_tasks.add_task(reindex_product, product_id=product.id)

            full = await tx.product.find_unique(
                where={"id": product.id},
                include={"variants": True, "images": True}
            )

            return full
        except UniqueViolationError:
            raise HTTPException(
                status_code=400, detail="Product with this name already exists")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=500, detail=str(e))


@router.post("/reindex", response_model=Message)
async def reindex_products(background_tasks: BackgroundTasks):
    """
    Re-index all products in the database to Meilisearch.
    """
    try:
        background_tasks.add_task(index_products)
        return Message(message="Re-indexing task enqueued.")
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


@router.get("/{slug}")
@cache_response("product", key=lambda request, slug, **kwargs: slug)
async def read(request: Request, slug: str):
    """Get a specific product by slug with Redis caching."""
    product = await db.product.find_unique(
        where={"slug": slug},
        include={
            "variants": True,
            "images": True,
        }
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


@router.put("/{id}")
async def update_product(id: int, product: ProductUpdate, background_tasks: BackgroundTasks):
    existing_product = await db.product.find_unique(where={"id": id})
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = {}

    if product.name is not None:
        update_data["name"] = product.name
        update_data["slug"] = slugify(product.name)
        update_data["sku"] = f"SK{slugify(product.name)}"

    if product.sku is not None:
        update_data["sku"] = product.sku

    if product.description is not None:
        update_data["description"] = product.description

    if product.category_ids is not None:
        category_ids = [{"id": id} for id in product.category_ids]
        update_data["categories"] = {"set": category_ids}

    if product.collection_ids is not None:
        collection_ids = [{"id": id} for id in product.collection_ids]
        update_data["collections"] = {"set": collection_ids}
    # if product.brand_id is not None:
    #     update_data["brand"] = {"connect": {"id": product.brand_id}}
    if product.active is not None:
        update_data["active"] = product.active

    try:
        updated_product = await db.product.update(
            where={"id": id},
            data=update_data,
        )
    except UniqueViolationError as e:
        logger.error(e)
        raise HTTPException(
            status_code=400, detail="Product with this name already exists")
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e))

    background_tasks.add_task(reindex_product, product_id=id)

    return updated_product


@router.delete("/{id}", dependencies=[Depends(get_current_user)])
async def delete_product(id: int) -> Message:
    """
    Delete a product.
    """
    product = await db.product.find_unique(
        where={"id": id},
        include={
            "shared_collections": True,
        }
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    async with db.tx() as tx:
        try:
            images = await tx.productimage.find_many(where={"product_id": id})
            paths = [image.image.split(
                "/storage/v1/object/public/product-images/")[1] for image in images]
            if paths:
                supabase.storage.from_("product-images").remove(paths)

            await tx.productimage.delete_many(where={"product_id": id})
            await tx.review.delete_many(where={"product_id": id})
            await tx.productvariant.delete_many(where={"product_id": id})

            await tx.product.delete(where={"id": id})
        except Exception as e:
            logger.error(e)

        service = RecentlyViewedService()
        await service.remove_product_from_all(product_id=id)
        await sync_index_product(product=product)
        return Message(message="Product deleted successfully")


@router.post("/{id}/variants")
async def create_variant(id: int, variant: VariantWithStatus, background_tasks: BackgroundTasks):
    product = await db.product.find_unique(where={"id": id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        created_variant = await db.productvariant.create(
            data={
                "sku": generate_sku(),
                "price": variant.price,
                "old_price": variant.old_price,
                "inventory": variant.inventory,
                "product_id": id,
                "status": variant.inventory > 0 and "IN_STOCK" or "OUT_OF_STOCK",
                "size": variant.size,
                "color": variant.color,
                "measurement": variant.measurement
            }
        )
    except UniqueViolationError as e:
        logger.error(e)
        raise HTTPException(
            status_code=400, detail="Variant with this details already exists")
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e))

    background_tasks.add_task(reindex_product, product_id=id)

    return created_variant


@router.put("/variants/{variant_id}")
async def update_variant(variant_id: int, variant: VariantWithStatus, background_tasks: BackgroundTasks):
    existing_variant = await db.productvariant.find_unique(where={"id": variant_id})
    if not existing_variant:
        raise HTTPException(status_code=404, detail="Variant not found")

    update_data = {}

    if variant.price:
        update_data["price"] = variant.price

    if variant.old_price:
        update_data["old_price"] = variant.old_price

    if variant.inventory is not None:
        update_data["inventory"] = variant.inventory
        update_data["status"] = variant.inventory > 0 and "IN_STOCK" or "OUT_OF_STOCK"

    if variant.size is not None:
        update_data["size"] = variant.size

    if variant.color is not None:
        update_data["color"] = variant.color

    if variant.measurement is not None:
        update_data["measurement"] = variant.measurement

    try:
        updated_variant = await db.productvariant.update(
            where={"id": variant_id},
            data=update_data,
        )
        background_tasks.add_task(
            reindex_product, product_id=existing_variant.product_id)
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e))

    return updated_variant


@router.delete("/variants/{variant_id}")
async def delete_variant(variant_id: int, background_tasks: BackgroundTasks):
    try:
        variant = await db.productvariant.delete(where={"id": variant_id})

        background_tasks.add_task(
            reindex_product, product_id=variant.product_id)
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e))

    return {"success": True}


@router.patch("/{id}/image")
async def add_image(id: int, image_data: ImageUpload, background_tasks: BackgroundTasks) -> Product:
    """
    Add an image to a product.
    """
    product = await db.product.find_unique(where={"id": id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        image_url = upload(bucket="product-images", data=image_data)

        updated_product = await db.product.update(
            where={"id": id},
            data={"image": image_url}
        )

        background_tasks.add_task(reindex_product, product_id=id)

        return updated_product

    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.post("/{id}/images")
async def upload_images(id: int, image_data: ImageUpload, background_tasks: BackgroundTasks):
    """
    Upload images to a product.
    """
    product = await db.product.find_unique(where={"id": id}, include={"images": True})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        image_url = upload(bucket="product-images", data=image_data)

        image = await db.productimage.create(
            data={
                "image": image_url,
                "product_id": product.id,
                "order": len(product.images)
            }
        )
        background_tasks.add_task(reindex_product, product_id=id)

        return image
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{id}/image")
async def delete_image(id: int):
    """
    Delete an image from a product.
    """
    product = await db.product.find_unique(where={"id": id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        file_path = product.image.split(
            "/storage/v1/object/public/product-images/")[1]

        supabase.storage.from_("product-images").remove([file_path])

        await db.product.update(where={"id": id}, data={"image": None})
        await reindex_product(product_id=id)

        return {"success": True}
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{id}/images/{image_id}")
async def delete_images(id: int, image_id: int, background_tasks: BackgroundTasks):
    """
    Delete an image from a product images.
    """
    product = await db.product.find_unique(where={"id": id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    image = await db.productimage.find_unique(where={"id": image_id})
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    async with db.tx() as tx:
        try:
            file_path = image.image.split(
                "/storage/v1/object/public/product-images/")[1]

            supabase.storage.from_("product-images").remove([file_path])
            await tx.productimage.delete(where={"id": image_id})
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=400, detail=str(e))

        # Reorder images
        images = await tx.productimage.find_many(where={"product_id": id}, order={"order": "asc"})
        for index, image in enumerate(images):
            await tx.productimage.update(
                where={"id": image.id},
                data={"order": index}
            )

        background_tasks.add_task(reindex_product, product_id=id)

        return {"success": True}


@router.delete("/gallery/{image_id}")
async def delete_gallery_image(image_id: int) -> Message:
    """
    Delete a gallery image.
    If the image is linked to a product, delete the entire product,
    its variants, reviews, and all images (both from DB and Supabase).
    """
    image = await db.productimage.find_unique(where={"id": image_id})
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    if not image.product_id:
        file_path = image.image.split(
            "/storage/v1/object/public/product-images/")[1]
        supabase.storage.from_("product-images").remove([file_path])
        await db.productimage.delete(where={"id": image_id})
        await invalidate_list("products:gallery")
        await manager.broadcast_to_all(
            data={
                "key": "products:gallery",
            },
            message_type="invalidate",
        )
        return Message(message="Image deleted successfully")

    product = await db.product.find_unique(
        where={"id": image.product_id},
        include={
            "shared_collections": True,
        }
    )

    async with db.tx() as tx:
        product_id = image.product_id

        images = await tx.productimage.find_many(where={"product_id": product_id})
        file_paths = [
            img.image.split("/storage/v1/object/public/product-images/")[1]
            for img in images
            if "/storage/v1/object/public/product-images/" in img.image
        ]

        if file_paths:
            supabase.storage.from_("product-images").remove(file_paths)

        await tx.productimage.delete_many(where={"product_id": product_id})
        await tx.review.delete_many(where={"product_id": product_id})
        await tx.productvariant.delete_many(where={"product_id": product_id})
        await tx.product.delete(where={"id": product_id})

    service = RecentlyViewedService()
    await service.remove_product_from_all(product_id=product_id)

    await sync_index_product(product=product)

    return Message(message="Product and all related data deleted successfully")


@router.post("/upload-products/")
async def upload_products(
    user: CurrentUser,
    background_tasks: BackgroundTasks,
):
    background_tasks.add_task(product_upload, user_id=user.id)
    return {"message": "Upload started"}


@router.post("/configure-filterable-attributes")
async def configure_filterable_attributes(
    attributes: list[str],
) -> Message:
    """
    Configure filterable attributes for the products index in Meilisearch.
    """
    try:
        index = get_or_create_index(settings.MEILI_PRODUCTS_INDEX)
        index.update_filterable_attributes(REQUIRED_FILTERABLES)
        index.update_sortable_attributes(REQUIRED_SORTABLES)

        logger.info(f"Updated filterable attributes: {attributes}")
        return Message(
            message=f"Filterable attributes updated successfully: {attributes}"
        )
    except Exception as e:
        logger.error(f"Error updating filterable attributes: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while updating filterable attributes.",
        ) from e


@router.get("/search/clear-index", response_model=dict)
async def config_clear_index():
    """
    Clear the products index in Meilisearch.
    """
    try:
        clear_index(settings.MEILI_PRODUCTS_INDEX)
        return {"message": "Index cleared"}
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=500, detail=str(e)
        ) from e


@router.get("/search/delete-index")
async def config_delete_index() -> dict:
    """
    Drop the products index in Meilisearch.
    """
    try:
        delete_index(settings.MEILI_PRODUCTS_INDEX)
        return {"message": "Index dropping"}
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=500, detail=str(e)
        ) from e


@router.patch("/{id}/images/reorder")
async def reorder_images(id: int, image_ids: list[int]):
    """
    Reorder product images.
    """
    product = await db.product.find_unique(where={"id": id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for index, image_id in enumerate(image_ids):
        try:
            await db.productimage.update(
                where={"id": image_id},
                data={"order": index}
            )
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=400, detail=str(e))

    await reindex_product(product_id=id)

    return {"success": True}


@router.post("/images/upload")
async def upload_product_images(
    payload: ProductBulkImages,
    background_tasks: BackgroundTasks,
):
    """
    Upload one or more product images to gallery using background task.
    """
    try:
        background_tasks.add_task(
            process_image_uploads_background,
            images=payload.images,
        )

        return {
            "success": True,
            "message": f"Image upload job started. Processing {len(payload.images)} images in background."
        }

    except Exception as e:
        logger.error(f"Error starting image upload job: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/images/bulk-delete")
async def bulk_delete_gallery_images(
    payload: ImageBulkDelete,
    background_tasks: BackgroundTasks,
):
    """
    Bulk delete gallery images.
    """
    print(payload)
    try:
        if not payload.files:
            raise HTTPException(
                status_code=400, detail="No image IDs provided")

        # Get images to delete
        images = await db.productimage.find_many(
            where={"id": {"in": payload.files}},
            include={"product": True}
        )

        if not images:
            raise HTTPException(status_code=404, detail="No images found")

        background_tasks.add_task(
            process_bulk_delete_images,
            image_ids=payload.files,
            images=images
        )

        return {
            "success": True,
            "message": f"Bulk delete job started. Processing {len(payload.files)} images in background."
        }

    except Exception as e:
        logger.error(f"Error starting bulk delete job: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{image_id}/metadata")
async def create_image_metadata(
    image_id: int,
    payload: ProductImageMetadata,
    background_tasks: BackgroundTasks,
):
    """
    Create a product, images and variants.
    - Creates variants (if provided)
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
                            }
                        )
                    except Exception as e:
                        logger.error(e)
                        raise HTTPException(
                            status_code=400, detail=f"Failed to create variant: {str(e)}")

            background_tasks.add_task(reindex_product, product_id=product.id)

            return {"success": True}
        except UniqueViolationError:
            raise HTTPException(
                status_code=400, detail="Product with this name already exists")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{image_id}/metadata")
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
                            }
                        )
                except Exception as e:
                    logger.error(e)
                    raise HTTPException(
                        status_code=400, detail=f"Failed to create variant: {str(e)}")

            background_tasks.add_task(
                reindex_product, product_id=existing_image.product_id)

            return {"success": True}
        except UniqueViolationError:
            raise HTTPException(
                status_code=400, detail="Product with this name already exists")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=500, detail=str(e))


@router.patch("/gallery/bulk-update")
async def bulk_update_products(payload: ImagesBulkUpdate, background_tasks: BackgroundTasks):
    images = await db.productimage.find_many(
        where={"id": {"in": payload.image_ids}},
        include={"product": {"include": {"variants": True}}},
    )

    if not images or len(images) != len(payload.image_ids):
        raise HTTPException(status_code=404, detail="Some images not found")

    background_tasks.add_task(handle_bulk_update_products, payload, images)

    return {"message": "Products update started"}
