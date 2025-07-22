from typing import Annotated, Any

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    UploadFile,
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
from app.core.logging import logger
from app.core.utils import slugify, url_to_list, generate_sku
from app.models.generic import Message, ImageUpload
from app.models.product import (
    ProductCreate,
    ProductUpdate,
    VariantWithStatus,
    Product, Products, SearchProducts, SearchProduct
)
from app.services.export import validate_file
from app.services.meilisearch import (
    clear_index,
    delete_document,
    delete_index,
    get_or_create_index,
)
from app.prisma_client import prisma as db
from math import ceil
from prisma.enums import ProductStatus
from pydantic import BaseModel
from app.core.storage import upload
from app.core.config import settings
from prisma.errors import UniqueViolationError
from app.services.product import index_products, reindex_product, product_upload, product_export
from app.services.redis import cache_response

router = APIRouter()


class LandingProducts(BaseModel):
    trending: list[SearchProduct]
    latest: list[SearchProduct]
    featured: list[SearchProduct]


@router.get("/landing-products")
@cache_response("products", key="landing-products", expire=86400)
async def get_landing_products(request: Request) -> LandingProducts:
    """
    Retrieve multiple product categories in a single request.
    """
    result = {}

    for product_type in ["trending", "latest", "featured"]:
        filters = [f"collections IN [{product_type}]", "min_variant_price >= 1"]
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
@cache_response("products", expire=86400)
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


@router.get("/search")
@cache_response("products", expire=600)
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
    }


@router.post("/")
async def create_product(product: ProductCreate, background_tasks: BackgroundTasks, redis: RedisClient):
    slugified_name = slugify(product.name)

    data = {
        "name": product.name,
        "slug": slugified_name,
        "sku": generate_sku(product_name=product.name),
        "description": product.description,
        "status": product.status or ProductStatus.IN_STOCK,
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
@cache_response("product", expire=86400, key=lambda request, slug, **kwargs: slug)
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

    if product.status is not None:
        update_data["status"] = product.status

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

    try:
        await db.productimage.delete_many(where={"product_id": id})
        await db.review.delete_many(where={"product_id": id})
        await db.productvariant.delete_many(where={"product_id": id})

        await db.product.delete(where={"id": id})

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
                "sku": generate_sku(product_name=product.name),
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
async def delete_image(id: int, background_tasks: BackgroundTasks, redis: RedisClient):
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
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e))

    try:
        await db.product.update(where={"id": id}, data={"image": None})

        background_tasks.add_task(reindex_product, cache=redis, product_id=id)

        return {"success": True}
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{id}/images/{image_id}")
async def delete_images(id: int, image_id: int, background_tasks: BackgroundTasks, redis: RedisClient):
    """
    Delete an image from a product images.
    """
    # Check if product exists
    product = await db.product.find_unique(where={"id": id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    image = await db.productimage.find_unique(where={"id": image_id})
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    try:
        file_path = image.image.split(
            "/storage/v1/object/public/product-images/")[1]

        supabase.storage.from_("product-images").remove([file_path])
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e))

    try:
        await db.productimage.delete(where={"id": image_id})
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e))

    # Reorder images
    images = await db.productimage.find_many(where={"product_id": id}, order={"order": "asc"})
    for index, image in enumerate(images):
        await db.productimage.update(
            where={"id": image.id},
            data={"order": index}
        )

    background_tasks.add_task(reindex_product, cache=redis, product_id=id)

    return {"success": True}


@router.post("/upload-products/")
async def upload_products(
    user: CurrentUser,
    file: Annotated[UploadFile, File()],
    background_tasks: BackgroundTasks,
    redis: RedisClient,
):
    logger.info(f"File uploaded: {file.filename}")
    content_type = file.content_type

    if content_type not in [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
    ]:
        logger.error(f"Invalid file type: {content_type}")
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only CSV/Excel files are supported.",
        )

    await validate_file(file=file)

    contents = await file.read()
    background_tasks.add_task(product_upload, cache=redis, user_id=user.id,
                              contents=contents, content_type=content_type, filename=file.filename)
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
