from typing import Any

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    BackgroundTasks,
    Request
)
from app.core.deps import CurrentUser, get_current_superuser
from app.core.logging import get_logger
from app.core.utils import slugify, url_to_list, generate_sku
from app.models.generic import Message, ImageUpload
from app.models.product import (
    ProductCreate,
    ProductUpdate,
    VariantWithStatus,
    Product, SearchProducts,
    ProductCreateBundle,
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
from app.core.storage import upload
from app.core.config import settings
from prisma.errors import UniqueViolationError
from app.services.product import reindex_product, product_upload, product_export, index_images, delete_image_index
from app.services.redis import cache_response
from meilisearch.errors import MeilisearchApiError
from app.services.recently_viewed import RecentlyViewedService
from app.core.storage import upload
from app.services.generic import remove_image_from_storage
from app.services.redis import invalidate_pattern

logger = get_logger(__name__)


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
        data["collections"] = {"connect": [{"id": id}
                                           for id in collection_ids]}
    return data

router = APIRouter()


# @router.get("/popular")
# async def get_popular_products(
#     limit: int = Query(default=10, le=20)
# ) -> list[SearchProduct]:
#     """Get popular products."""
#     service = PopularProductsService()
#     products = await service.get_popular_products(limit)
#     return products


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


@router.get("/")
@cache_response("products")
async def search(
    request: Request,
    search: str = "",
    sort: str = "id:desc",
    cat_ids: str = Query(default=""),
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
    if cat_ids:
        filters.append(f"category_slugs IN {url_to_list(cat_ids)}")
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
        "sort": [sort or "id:desc"],
    }

    if show_facets:
        search_params["facets"] = ["category_slugs", "sizes", "colors"]

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
            detail=str(e)
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


@router.post("/", dependencies=[Depends(get_current_superuser)])
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

    await invalidate_pattern("gallery")
    background_tasks.add_task(reindex_product, product_id=created_product.id)

    return created_product


@router.post("/create-bundle", dependencies=[Depends(get_current_superuser)])
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

            await invalidate_pattern("gallery")
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
    Re-index all products in the db to Meilisearch.
    """
    try:
        background_tasks.add_task(index_images)
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


@router.put("/{id}", dependencies=[Depends(get_current_superuser)])
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

    await invalidate_pattern("gallery")
    background_tasks.add_task(reindex_product, product_id=id)

    return updated_product


@router.delete("/{id}", dependencies=[Depends(get_current_superuser)])
async def delete_product(id: int) -> Message:
    """
    Delete a product.
    """
    product = await db.product.find_unique(
        where={"id": id},
        include={
            "images": True,
        }
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    async with db.tx() as tx:
        try:
            await remove_image_from_storage(images=[img.image for img in product.images])

            await tx.productimage.delete_many(where={"product_id": id})
            await tx.review.delete_many(where={"product_id": id})
            await tx.productvariant.delete_many(where={"product_id": id})

            await tx.product.delete(where={"id": id})
        except Exception as e:
            logger.error(e)

        service = RecentlyViewedService()
        await service.remove_product_from_all(product_id=id)
        await delete_image_index(images=product.images)
        await invalidate_pattern("gallery")
        return Message(message="Product deleted successfully")


@router.post("/{id}/variants", dependencies=[Depends(get_current_superuser)])
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

    await invalidate_pattern("gallery")
    background_tasks.add_task(reindex_product, product_id=id)

    return created_variant


@router.put("/variants/{variant_id}", dependencies=[Depends(get_current_superuser)])
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
        await invalidate_pattern("gallery")
        background_tasks.add_task(
            reindex_product, product_id=existing_variant.product_id)
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e))

    return updated_variant


@router.delete("/variants/{variant_id}", dependencies=[Depends(get_current_superuser)])
async def delete_variant(variant_id: int, background_tasks: BackgroundTasks):
    try:
        variant = await db.productvariant.delete(where={"id": variant_id})

        background_tasks.add_task(
            reindex_product, product_id=variant.product_id)
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e))

    return {"success": True}


@router.patch("/{id}/image", dependencies=[Depends(get_current_superuser)])
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

        await invalidate_pattern("gallery")
        background_tasks.add_task(reindex_product, product_id=id)

        return updated_product

    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.post("/{id}/images", dependencies=[Depends(get_current_superuser)])
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

        await invalidate_pattern("gallery")
        background_tasks.add_task(reindex_product, product_id=id)

        return image
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{id}/images/{image_id}", dependencies=[Depends(get_current_superuser)])
async def delete_product_image(id: int, image_id: int, background_tasks: BackgroundTasks):
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
            await remove_image_from_storage(image.image)
            await tx.productimage.delete(where={"id": image_id})
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=400, detail=str(e))

        images = await tx.productimage.find_many(where={"product_id": id}, order={"order": "asc"})
        for index, image in enumerate(images):
            await tx.productimage.update(
                where={"id": image.id},
                data={"order": index}
            )

        await invalidate_pattern("gallery")
        background_tasks.add_task(reindex_product, product_id=id)

        return {"success": True}


@router.post("/upload-products/", dependencies=[Depends(get_current_superuser)])
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
        # index.update_non_separator_tokens(["-"])

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


@router.get("/search/clear-index", dependencies=[Depends(get_current_superuser)], response_model=dict)
async def config_clear_index():
    """
    Clear the products index in Meilisearch.
    """
    try:
        await clear_index(settings.MEILI_PRODUCTS_INDEX)
        return {"message": "Index cleared"}
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=500, detail=str(e)
        ) from e


@router.post("/search/delete-index", dependencies=[Depends(get_current_superuser)])
async def config_delete_index(index_name: str) -> dict:
    """
    Drop the products index in Meilisearch.
    """
    try:
        delete_index(index_name)
        return {"message": "Index dropped"}
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=500, detail=str(e)
        ) from e


@router.patch("/{id}/images/reorder", dependencies=[Depends(get_current_superuser)])
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
