from typing import Any

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
    meilisearch_client,
    supabase,
    RedisClient
)
from app.core.logging import get_logger
from app.core.utils import slugify, url_to_list, generate_sku
from app.models.generic import Message, ImageUpload
from app.models.product import (
    ProductCreate,
    ProductUpdate,
    VariantWithStatus,
    Product, Products, SearchProducts, SearchProduct,
    ProductCreateBundle,
    ProductBulkImages,
    ProductImageMetadata
)
from app.services.meilisearch import (
    clear_index,
    delete_document,
    delete_index,
    get_or_create_index,
)
from app.prisma_client import prisma as db
from math import ceil
from pydantic import BaseModel
from app.core.storage import upload
from app.core.config import settings
from prisma.errors import UniqueViolationError
from app.services.product import index_products, reindex_product, product_upload, product_export
from app.services.redis import cache_response

logger = get_logger(__name__)

router = APIRouter()


class LandingProducts(BaseModel):
    trending: list[SearchProduct]
    latest: list[SearchProduct]
    featured: list[SearchProduct]


@router.get("/landing-products")
@cache_response("products", key="landing-products")
async def get_landing_products(request: Request) -> LandingProducts:
    """
    Retrieve multiple product categories in a single request.
    """
    result = {}

    for product_type in ["trending", "latest", "featured"]:
        filters = [
            f"collections IN [{product_type}]", "min_variant_price >= 1"]
        search_params = {
            "limit": 6 if product_type == "featured" else 4,
            "offset": 0,
            "sort": ["created_at:desc"],
            "filter": " AND ".join(filters) if filters else None,
        }

        try:
            search_results = meilisearch_client.index(settings.MEILI_PRODUCTS_INDEX).search(
                "",
                {
                    **search_params
                }
            )
        except Exception as e:
            logger.error(e)
            raise HTTPException(
                status_code=400,
                detail=str(e)
            )
        result[product_type] = search_results["hits"]

    return result


@router.get("/gallery")
async def image_gallery(skip: int = Query(default=0), limit: int = Query(default=10)):
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
            order={"created_at": "desc"},
            include={
                "product": {
                    "include": {
                        "categories": True,
                        "collections": True,
                        "variants": True,
                        "images": True,
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


@router.get("/")
@cache_response("products")
async def index(
    request: Request,
    query: str = "",
    brand: str = Query(default=""),
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> Products:
    """
    Retrieve products.
    """
    where_clause = None
    if brand:
        where_clause = {
            "brand": {"name": {"contains": brand, "mode": "insensitive"}}
        }
    if query:
        where_clause = {
            "OR": [
                {"name": {"contains": query, "mode": "insensitive"}},
                {"slug": {"contains": query, "mode": "insensitive"}},
                {"description": {"contains": query, "mode": "insensitive"}}
            ]
        }
    products = await db.product.find_many(
        where=where_clause,
        skip=(page - 1) * limit,
        take=limit,
        order={"created_at": "desc"},
        include={
            "categories": True,
            "collections": True,
            "brand": True,
            "tags": True,
            "variants": True,
            "images": True,
        }
    )
    total = await db.product.count(where=where_clause)
    return {
        "products": products,
        "page": page,
        "limit": limit,
        "total_pages": ceil(total/limit),
        "total_count": total,
    }


@router.get("/search/public")
@cache_response("products", expire=3600)
async def search(
    request: Request,
    q: str = "",
    sort: str = "created_at:desc",
    categories: str = Query(default=""),
    collections: str = Query(default=""),
    max_price: int = Query(default=1000000, gt=0),
    min_price: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> list[SearchProduct]:
    """
    Retrieve products using Meilisearch, sorted by latest.
    """
    filters = []
    if categories:
        filters.append(f"categories IN {url_to_list(categories)}")
    if collections:
        filters.append(f"collections IN [{collections}]")
    if min_price and max_price:
        filters.append(
            f"min_variant_price >= {min_price} AND max_variant_price <= {max_price}")

    search_params = {
        "limit": limit,
        "sort": [sort],
    }

    if filters:
        search_params["filter"] = " AND ".join(filters)

    try:
        search_results = meilisearch_client.index(settings.MEILI_PRODUCTS_INDEX).search(
            q,
            {
                **search_params
            }
        )
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400,
            detail=e.message
        )

    return search_results["hits"]


@router.get("/search")
@cache_response("products", expire=3600)
async def search(
    request: Request,
    search: str = "",
    sort: str = "created_at:desc",
    brand_id: str = Query(default=""),
    categories: str = Query(default=""),
    collections: str = Query(default=""),
    max_price: int = Query(default=1000000, gt=0),
    min_price: int = Query(default=1, gt=0),
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> SearchProducts:
    """
    Retrieve products using Meilisearch, sorted by latest.
    """
    filters = []
    if brand_id:
        brands = brand_id.split(",")
        filters.append(" OR ".join([f'brand = "{brand}"' for brand in brands]))
    if categories:
        filters.append(f"categories IN {url_to_list(categories)}")
    if collections:
        filters.append(f"collections IN [{collections}]")
    if min_price and max_price:
        filters.append(
            f"min_variant_price >= {min_price} AND max_variant_price <= {max_price}")

    search_params = {
        "limit": limit,
        "offset": (page - 1) * limit,
        "sort": [sort],
        "facets": ["brand", "categories", "collections"],
    }

    if filters:
        search_params["filter"] = " AND ".join(filters)

    try:
        search_results = meilisearch_client.index(settings.MEILI_PRODUCTS_INDEX).search(
            search,
            {
                **search_params
            }
        )
        suggestions_raw = meilisearch_client.index(settings.MEILI_PRODUCTS_INDEX).search(
            search,
            {
                "limit": 4,
                "attributesToRetrieve": ["name"],
                "matchingStrategy": "all"
            }
        )
        suggestions = list(
            {hit["name"] for hit in suggestions_raw["hits"] if "name" in hit})
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
        "page": page,
        "limit": limit,
        "total_count": total_count,
        "total_pages": total_pages,
        "suggestions": suggestions,
    }


@router.post("/")
async def create_product(product: ProductCreate, background_tasks: BackgroundTasks, redis: RedisClient):
    slugified_name = slugify(product.name)

    data = {
        "name": product.name,
        "slug": slugified_name,
        "sku": generate_sku(),
        "description": product.description,
        "brand": {"connect": {"id": product.brand_id}},
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
        created_product = await db.product.create(
            data=data,
        )
    except UniqueViolationError as e:
        logger.error(e)
        raise HTTPException(
            status_code=400, detail="Product with this name already exists")

    background_tasks.add_task(
        reindex_product, cache=redis, product_id=created_product.id)

    return created_product


@router.post("/create-bundle")
async def create_product_bundle(
    payload: ProductCreateBundle,
    background_tasks: BackgroundTasks,
    redis: RedisClient,
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
            }

            if payload.brand_id is not None:
                data["brand"] = {"connect": {"id": payload.brand_id}}

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

            # Additional images
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

            # Variants
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
                            }
                        )
                    except Exception as e:
                        logger.error(e)
                        raise HTTPException(
                            status_code=400, detail=f"Failed to create variant: {str(e)}")

            background_tasks.add_task(
                reindex_product, cache=redis, product_id=product.id)

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
async def reindex_products(background_tasks: BackgroundTasks, redis: RedisClient):
    """
    Re-index all products in the database to Meilisearch.
    """
    try:
        background_tasks.add_task(index_products, redis)
        return Message(message="Re-indexing task enqueued.")
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


@router.get("/{slug}")
@cache_response("product", key=lambda request, slug, **kwargs: slug)
async def read(slug: str, request: Request):
    """
    Get a specific product by slug with Redis caching.
    """
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
async def update_product(id: int, product: ProductUpdate, background_tasks: BackgroundTasks, redis: RedisClient):
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
    if product.brand_id is not None:
        update_data["brand"] = {"connect": {"id": product.brand_id}}

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

    background_tasks.add_task(reindex_product, cache=redis, product_id=id)

    return updated_product


@router.delete("/{id}", dependencies=[Depends(get_current_user)])
async def delete_product(id: int, redis: RedisClient) -> Message:
    """
    Delete a product.
    """
    product = await db.product.find_unique(where={"id": id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    async with db.tx() as tx:
        try:
            images = await tx.productimage.find_many(where={"product_id": id})
            paths = [image.image.split("/storage/v1/object/public/product-images/")[1] for image in images]
            if paths:
                supabase.storage.from_("product-images").remove(paths)

            await tx.productimage.delete_many(where={"product_id": id})
            await tx.review.delete_many(where={"product_id": id})
            await tx.productvariant.delete_many(where={"product_id": id})

            await tx.product.delete(where={"id": id})

            delete_document(index_name=settings.MEILI_PRODUCTS_INDEX,
                            document_id=str(id))
        except Exception as e:
            logger.error(e)

        await redis.invalidate_list_cache("products")
        await redis.bust_tag(f"product:{product.slug}")
        return Message(message="Product deleted successfully")


@router.post("/{id}/variants")
async def create_variant(id: int, variant: VariantWithStatus, background_tasks: BackgroundTasks, redis: RedisClient):
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
                "color": variant.color
            }
        )
    except UniqueViolationError as e:
        logger.error(e)
        raise HTTPException(
            status_code=400, detail="Variant with this details already exists")
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e))

    background_tasks.add_task(reindex_product, cache=redis, product_id=id)

    return created_variant


@router.put("/variants/{variant_id}")
async def update_variant(variant_id: int, variant: VariantWithStatus, background_tasks: BackgroundTasks, redis: RedisClient):
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

    try:
        updated_variant = await db.productvariant.update(
            where={"id": variant_id},
            data=update_data,
        )
        background_tasks.add_task(
            reindex_product, cache=redis, product_id=existing_variant.product_id)
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e))

    return updated_variant


@router.delete("/variants/{variant_id}")
async def delete_variant(variant_id: int, background_tasks: BackgroundTasks, redis: RedisClient):
    try:
        variant = await db.productvariant.delete(where={"id": variant_id})

        background_tasks.add_task(
            reindex_product, cache=redis, product_id=variant.product_id)
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e))

    return {"success": True}


@router.patch("/{id}/image")
async def add_image(id: int, image_data: ImageUpload, background_tasks: BackgroundTasks, redis: RedisClient) -> Product:
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

        background_tasks.add_task(reindex_product, cache=redis, product_id=id)

        return updated_product

    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.post("/{id}/images")
async def upload_images(id: int, image_data: ImageUpload, background_tasks: BackgroundTasks, redis: RedisClient):
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
        background_tasks.add_task(reindex_product, cache=redis, product_id=id)

        return image
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{id}/image")
async def delete_image(id: int, redis: RedisClient):
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
        await reindex_product(cache=redis, product_id=id)

        return {"success": True}
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{id}/images/{image_id}")
async def delete_images(id: int, image_id: int, background_tasks: BackgroundTasks, redis: RedisClient):
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

        background_tasks.add_task(reindex_product, cache=redis, product_id=id)

        return {"success": True}


@router.delete("/gallery/{image_id}")
async def delete_gallery_image(image_id: int, redis: RedisClient) -> Message:
    """
    Delete an image from gallery.
    """
    image = await db.productimage.find_unique(where={"id": image_id})
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    async with db.tx() as tx:
        try:
            file_path = image.image.split(
                "/storage/v1/object/public/product-images/")[1]

            supabase.storage.from_("product-images").remove([file_path])

            await tx.productimage.delete(where={"id": image_id})
            if image.product_id:
                images = await tx.productimage.find_many(where={"product_id": image.product_id})
                paths = [image.image.split("/storage/v1/object/public/product-images/")[1] for image in images]
                if paths:
                    supabase.storage.from_("product-images").remove(paths)

                await tx.productimage.delete_many(where={"product_id": image.product_id})
                await tx.review.delete_many(where={"product_id": image.product_id})
                await tx.productvariant.delete_many(where={"product_id": image.product_id})

                await tx.product.delete(where={"id": image.product_id})

                delete_document(index_name=settings.MEILI_PRODUCTS_INDEX,
                                document_id=str(image.product_id))
                await reindex_product(cache=redis, product_id=image.product_id)

                await redis.invalidate_list_cache("products")
                await redis.invalidate_list_cache("shared")
                await redis.invalidate_list_cache("sharedcollection")
            return Message(message="Product deleted successfully")
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=400, detail=str(e))


@router.post("/upload-products/")
async def upload_products(
    user: CurrentUser,
    background_tasks: BackgroundTasks,
    redis: RedisClient,
):
    background_tasks.add_task(product_upload, cache=redis, user_id=user.id)
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
        index.update_filterable_attributes(
            ["id", "brand", "categories", "collections", "name", "variants", "average_rating",
                "review_count", "max_variant_price", "min_variant_price"]
        )
        index.update_sortable_attributes(
            ["created_at", "max_variant_price", "min_variant_price", "average_rating", "review_count"])

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
async def reorder_images(id: int, image_ids: list[int], redis: RedisClient):
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

    await reindex_product(cache=redis, product_id=id)

    return {"success": True}


@router.post("/images/upload")
async def upload_product_images(payload: ProductBulkImages):
    """
    Upload one or more product images.
    """
    try:
        created_images = []
        for index, img in enumerate(payload.images):
            try:
                image_url = upload(bucket="product-images", data=img)
                created_images.append({
                    "image": image_url,
                    "order": 0,
                })
            except Exception as e:
                logger.error(e)
                raise HTTPException(
                    status_code=400, detail=f"Failed to upload image {index + 1}: {str(e)}")

        if created_images:
            await db.productimage.create_many(data=created_images)

        return {"success": True}
    except UniqueViolationError:
        raise HTTPException(
            status_code=400, detail="Product with this name already exists")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{image_id}/metadata")
async def create_image_metadata(
    image_id: int,
    payload: ProductImageMetadata,
    background_tasks: BackgroundTasks,
    redis: RedisClient,
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
                # "description": payload.description,
            }

            if payload.brand_id is not None:
                data["brand"] = {"connect": {"id": payload.brand_id}}

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

            # Variants
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
                            }
                        )
                    except Exception as e:
                        logger.error(e)
                        raise HTTPException(
                            status_code=400, detail=f"Failed to create variant: {str(e)}")

            background_tasks.add_task(
                reindex_product, cache=redis, product_id=product.id)

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
    redis: RedisClient,
):
    """
    Create a product, images and variants.
    - Creates the product with provided relations
    - Uploads additional images to Supabase (if provided)
    - Creates variants (if provided)
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
            if payload.brand_id is not None:
                update_data["brand"] = {"connect": {"id": payload.brand_id}}

            await db.product.update(
                where={"id": existing_image.product_id},
                data=update_data,
            )

            # Variants
            for variant in payload.variants:
                try:
                    await tx.productvariant.upsert(
                        where={
                            'id': variant.id
                        },
                        data={
                            "create": {
                                "product_id": existing_image.product_id,
                                'sku': generate_sku(),
                                'price': variant.price,
                                'old_price': variant.old_price,
                                'inventory': variant.inventory,
                                'status': variant.inventory > 0 and "IN_STOCK" or "OUT_OF_STOCK",
                                'size': variant.size,
                                'color': variant.color,
                            },
                            "update": {
                                'price': variant.price,
                                'old_price': variant.old_price,
                                'inventory': variant.inventory,
                                'status': variant.inventory > 0 and "IN_STOCK" or "OUT_OF_STOCK",
                                'size': variant.size,
                                'color': variant.color,
                            }
                        },
                    )
                except Exception as e:
                    logger.error(e)
                    raise HTTPException(
                        status_code=400, detail=f"Failed to create variant: {str(e)}")

            background_tasks.add_task(
                reindex_product, cache=redis, product_id=existing_image.product_id)

            return {"success": True}
        except UniqueViolationError:
            raise HTTPException(
                status_code=400, detail="Product with this name already exists")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=500, detail=str(e))
