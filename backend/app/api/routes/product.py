import asyncio
import base64
from typing import Annotated, Any
import uuid

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    HTTPException,
    Query,
    UploadFile,
)
from app.core.decorators import cache
from app.core.deps import (
    CacheService,
    CurrentUser,
    get_current_user,
)
from app.core.logging import logger
from app.core.utils import slugify, url_to_list
from app.models.product import Product, Products, SearchProducts
from app.models.reviews import  Reviews
from app.models.generic import Message
from app.models.product import (
    ImageUpload,
    ProductCreate,
    ProductUpdate,
    VariantWithStatus,
)
from app.services.export import validate_file
from app.services.meilisearch import (
    add_documents_to_index,
    clear_index,
    delete_document,
    delete_index,
    get_or_create_index,
    search_documents,
    update_document,
)
from app.services.run_sheet import generate_excel_file, process_products
from supabase import create_client, Client
from app.core.config import settings
from app.prisma_client import prisma as db
from math import ceil
from prisma.enums import ProductStatus

# Initialize Supabase client
supabase_url = settings.SUPABASE_URL
supabase_key = settings.SUPABASE_KEY
supabase: Client = create_client(supabase_url, supabase_key)

# Create a router for products
router = APIRouter()


@router.post("/export")
async def export_products(
    current_user: CurrentUser,
    background_tasks: BackgroundTasks
) -> Any:
    try:
        # Define the background task
        def run_task():
            asyncio.run(
                generate_excel_file(email=current_user.email)
            )

            # crud.activities.create_product_export_activity(
            #     db=db, user_id=current_user.id, download_url=download_url
            # )

        background_tasks.add_task(run_task)

        return {
            "message": "Data Export successful. Please check your email"
        }
    except Exception as e:
        logger.error(f"Export products error: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/")
async def index(
    query: str = "",
    brands: str = Query(default=""),
    categories: str = Query(default=""),
    collections: str = Query(default=""),
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> Products:
    """
    Retrieve products with Redis caching.
    """
    where_clause = None
    if query:
        where_clause = {
            "OR": [
                {"name": {"contains": query, "mode": "insensitive"}},
                {"slug": {"contains": query, "mode": "insensitive"}},
                {"description": {"contains": query, "mode": "insensitive"}},
                {"sku": {"contains": query, "mode": "insensitive"}},
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
            "brands": True,
            "tags": True,
            "variants": True,
            "images": True,
            "reviews": { "include": { "user": True } },
        }
    )
    total = await db.product.count(where=where_clause)
    return {
        "products":products,
        "page":page,
        "limit":limit,
        "total_pages":ceil(total/limit),
        "total_count":total,
    }



@router.get("/search")
@cache(key="search")
async def search(
    search: str = "",
    sort: str = "created_at:desc",
    brands: str = Query(default=""),
    categories: str = Query(default=""),
    collections: str = Query(default=""),
    maxPrice: int = Query(default=1000000, gt=0),
    minPrice: int = Query(default=1, gt=0),
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> SearchProducts:
    """
    Retrieve products using Meilisearch, sorted by latest.
    """
    filters = []
    # if tag:
    #     filters.append(f"tag = '{tag}'")
    if brands:
        filters.append(f"brands IN {url_to_list(brands)}")
    if categories:
        filters.append(f"categories IN {url_to_list(categories)}")
    if collections:
        filters.append(f"collections IN [{collections}]")
    if minPrice and maxPrice:
        filters.append(f"price >= {minPrice} AND price <= {maxPrice}")

    search_params = {
        "limit": limit,
        "offset": (page - 1) * limit,
        "sort": [sort],
        "facets": ["brands", "categories", "collections"],
    }

    if filters:
        search_params["filter"] = " AND ".join(filters)

    try:
        search_results = search_documents(index_name="products", query=search, **search_params)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error searching products: {str(e)}"
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
async def create_product(product: ProductCreate, cache: CacheService):
    slugified_name = slugify(product.name)
    sku = product.sku or f"SK{slugified_name}"

    data={
        "name": product.name,
        "slug": slugified_name,
        "sku": sku,
        "description": product.description,
        "price": product.price or 0,
        "old_price": product.old_price or 0,
        "status": product.status or ProductStatus.IN_STOCK,
    };

    # Prepare category connections if provided
    if product.category_ids:
        category_connect = [{"id": id} for id in product.category_ids]
        data["categories"] = {"connect": category_connect}

    # Prepare brand connections if provided
    if product.brand_ids:
        brand_connect = [{"id": id} for id in product.brand_ids]
        data["brands"] = {"connect": brand_connect}

    # Prepare collection connections if provided
    if product.collection_ids:
        collection_connect = [{"id": id} for id in product.collection_ids]
        data["collections"] = {"connect": collection_connect}

    # Prepare tag connections if provided
    if product.tags_ids:
        tag_connect = [{"id": id} for id in product.tags_ids]
        data["tags"] = {"connect": tag_connect}

    # Prepare variants if provided
    variants_create = None
    if product.variants:
        variants_create = []
        for variant in product.variants:
            variant_slug = slugify(variant.name)
            variants_create.append({
                "name": variant.name,
                "slug": variant_slug,
                "sku": f"SK{variant_slug}",
                "price": variant.price,
                "inventory": variant.inventory
            })
        data["variants"] = {"create": variants_create}

    # Prepare images if provided
    images_create = None
    if product.images:
        images_create = [{"url": str(url)} for url in product.images]
        data["images"] = {"create": images_create}



    # Create product with all related data
    created_product = await db.product.create(
        data=data,
        include={
            "categories": True,
            "brands": True,
            "collections": True,
            "tags": True,
            "variants": True,
            "images": True
        }
    )

    try:
        # Create a dictionary with product data and collection names
        product_data = prepare_product_data_for_indexing(created_product)

        add_documents_to_index(index_name="products", documents=[product_data])
        cache.invalidate("search")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    # return product

    return created_product


@router.get("/{slug}")
# @cache(key="product", hash=False)
async def read(slug: str) -> Product:
    """
    Get a specific product by slug with Redis caching.
    """
    product = await db.product.find_unique(
        where={"slug": slug},
        include={
            "variants": True,
            # "categories": True,
            "images": True,
            "reviews": { "include": { "user": True } },
        }
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


@router.get("/{id}/reviews")
@cache(key="reviews", hash=False)
async def read_reviews(id: str) -> Reviews:
    """
    Get a specific product reviews with Redis caching.
    """
    review = await db.review.find_unique(where={"product_id": id})
    if not review:
        raise HTTPException(status_code=404, detail="Reviews not found")

    return review



@router.put("/{id}")
async def update_product(id: int, product: ProductUpdate, cache: CacheService, background_tasks: BackgroundTasks):
    # Check if product exists
    existing_product = await db.product.find_unique(where={"id": id})
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Prepare update data
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

    # Handle category updates if provided
    if product.category_ids is not None:
        category_ids = [{"id": id} for id in product.category_ids]
        update_data["categories"] = {"set": category_ids}

    # Handle collection updates if provided
    if product.collection_ids is not None:
        collection_ids = [{"id": id} for id in product.collection_ids]
        update_data["collections"] = {"set": collection_ids}

    # Handle brand updates if provided
    if product.brand_ids is not None:
        brand_ids = [{"id": id} for id in product.brand_ids]
        update_data["brands"] = {"set": brand_ids}

    # Handle variant updates if provided
    if product.variants is not None:
        variant_updates = []
        for variant in product.variants:
            if variant.id:  # Update existing variant
                variant_data = {}
                if variant.name:
                    variant_data["name"] = variant.name
                    variant_data["slug"] = slugify(variant.name)
                    variant_data["sku"] = f"SK{slugify(variant.name)}"
                if variant.price:
                    variant_data["price"] = variant.price
                if variant.inventory is not None:
                    variant_data["inventory"] = variant.inventory

                # Only include in updates if there's data to update
                if variant_data:
                    variant_updates.append({
                        "where": {"id": variant.id},
                        "data": variant_data
                    })
            else:  # Create new variant
                if variant.name:
                    slug = slugify(variant.name)
                    variant_updates.append({
                        "create": {
                            "name": variant.name,
                            "slug": slug,
                            "sku": f"SK{slug}",
                            "price": variant.price or 0,
                            "inventory": variant.inventory or 0
                        }
                    })

        # Add variant updates to the update_data
        if variant_updates:
            update_data["variants"] = {"upsert": variant_updates}

    # Handle image updates if provided
    if product.images is not None:
        # Delete existing images
        await db.product_image.delete_many(where={"product_id": id})

        # Create new images
        image_creates = [{"url": str(url), "product_id": id} for url in product.images]
        for image_data in image_creates:
            await db.product_image.create(data=image_data)

    # Update the product
    updated_product = await db.product.update(
        where={"id": id},
        data=update_data,
        include={
            "variants": True,
            "categories": True,
            "images": True
        }
    )
    cache.invalidate("search")

    try:
        # Define the background task
        def update_task(product: Product):
            # Prepare product data for Meilisearch indexing
            product_data = prepare_product_data_for_indexing(product)

            update_document(index_name="products", document=product_data)
            cache.invalidate("search")

        background_tasks.add_task(update_task, product=updated_product)
        return updated_product
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400,
            detail=f"{e}",
        ) from e


@router.delete("/{id}")
async def delete_product(id: int, user=Depends(get_current_user))-> Message:
    """
    Delete a product.
    """
    # Delete related data first due to foreign key constraints
    await db.product_image.delete_many(where={"product_id": id})
    await db.review.delete_many(where={"product_id": id})
    await db.product_variant.delete_many(where={"product_id": id})

    # Delete the product
    await db.product.delete(where={"id": id})

    try:
        delete_document(index_name="products", document_id=str(id))
    except Exception as e:
        logger.error(f"Error deleting document from Meilisearch: {e}")
    return Message(message="Product deleted successfully")


@router.post("/{id}/variants")
async def create_variant(id: int, variant: VariantWithStatus):
    # Check if product exists
    product = await db.product.find_unique(where={"id": id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Create slug from name
    slug = slugify(variant.name)

    # Create the variant
    created_variant = await db.product_variant.create(
        data={
            "name": variant.name,
            "slug": slug,
            "sku": variant.sku or f"SK{slug}",
            "price": variant.price,
            "inventory": variant.inventory,
            "product_id": id,
            "status": variant.status
        }
    )

    return created_variant

@router.put("/variants/{variant_id}")
async def update_variant(variant_id: int, variant: VariantWithStatus):
    # Check if variant exists
    existing_variant = await db.product_variant.find_unique(where={"id": variant_id})
    if not existing_variant:
        raise HTTPException(status_code=404, detail="Variant not found")

    # Prepare update data
    update_data = {}

    if variant.name:
        update_data["name"] = variant.name
        slug = slugify(variant.name)
        update_data["slug"] = slug

    if variant.price:
        update_data["price"] = variant.price

    if variant.inventory is not None:
        update_data["inventory"] = variant.inventory

    if variant.status:
        update_data["status"] = variant.status

    # Update the variant
    updated_variant = await db.product_variant.update(
        where={"id": variant_id},
        data=update_data
    )

    return updated_variant

@router.delete("/variants/{variant_id}")
async def delete_variant(variant_id: int):
    # Delete the variant
    deleted_variant = await db.product_variant.delete(where={"id": variant_id})

    return deleted_variant

@router.post("/upload-image")
async def upload_image(image_data: ImageUpload):
    # Check if product exists
    product = await db.product.find_unique(where={"id": image_data.product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Decode base64 file
    file_bytes = base64.b64decode(image_data.file)

    # Generate unique filename
    file_extension = image_data.file_name.split('.')[-1]
    unique_filename = f"{image_data.product_id}/{uuid.uuid4()}.{file_extension}"

    # Upload file to Supabase
    result = supabase.storage.from_("product-images").upload(
        unique_filename,
        file_bytes,
        {"content-type": image_data.content_type}
    )

    if result.get("error"):
        raise HTTPException(
            status_code=500,
            detail=f"Upload failed: {result['error']}"
        )

    # Get public URL
    public_url = supabase.storage.from_("product-images").get_public_url(unique_filename)

    # Create image record in database
    image = await db.product_image.create(
        data={
            "url": public_url,
            "product_id": image_data.product_id
        }
    )

    return image

@router.delete("/images/{image_id}")
async def delete_image(image_id: int):
    # Get image details
    image = await db.product_image.find_unique(where={"id": image_id})
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    # Extract file path from URL
    file_path = image.url.split("/storage/v1/object/public/product-images/")[1]

    # Delete from Supabase
    result = supabase.storage.from_("product-images").remove([file_path])

    if result.get("error"):
        raise HTTPException(
            status_code=500,
            detail=f"Delete failed: {result['error']}"
        )

    # Delete from database
    await db.product_image.delete(where={"id": image_id})

    return {"success": True}


@router.post("/upload-products/")
async def upload_products(
    user: CurrentUser,
    file: Annotated[UploadFile, File()],
    background_tasks: BackgroundTasks,
    cache: CacheService,
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

    # Define the background task
    def update_task():
        logger.info("Starting product upload processing...")
        try:
            asyncio.run(
                process_products(file_content=contents, content_type=content_type, user_id=user.id)
            )

            products = asyncio.run(db.product.find_many(
                include={
                    # "variants": True,
                    "categories": True,
                    "collections": True,
                    "brands": True,
                    "images": True,
                    # "reviews": { "include": { "user": True } },
                }
            ))

            # Re-index
            asyncio.run(
                index_products(products=products, cache=cache)
            )
        except Exception as e:
            logger.error(f"Error processing data from file: {e}")


        # crud.activities.create_product_upload_activity(
        #     db=db, user_id=user.id, filename=file.filename
        # )

    background_tasks.add_task(update_task)

    return {"message": "Upload started"}


@router.post("/reindex", dependencies=[], response_model=Message)
async def reindex_products(cache: CacheService, background_tasks: BackgroundTasks):
    """
    Re-index all products in the database to Meilisearch.
    This operation is performed asynchronously in the background.
    """
    try:
        products = await db.product.find_many(
            include={
                "variants": True,
                "categories": True,
                "collections": True,
                "brands": True,
                "images": True,
                # "reviews": { "include": { "user": True } },
            }
        )
        # Add the task to background tasks
        background_tasks.add_task(index_products, products, cache)

        return Message(message="Product re-indexing started. This may take a while.")
    except Exception as e:
        logger.error(f"Error during product re-indexing: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while starting the re-indexing process.",
        ) from e


@router.post("/configure-filterable-attributes")
async def configure_filterable_attributes(
    attributes: list[str],
) -> Message:
    """
    Configure filterable attributes for the products index in Meilisearch.
    """
    try:
        index = get_or_create_index("products")
        # Update the filterable attributes
        index.update_filterable_attributes(
            ["brands", "categories", "collections", "name", "price", "slug"]
        )
        # Update the sortable attributes
        index.update_sortable_attributes(["created_at", "price"])

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
        clear_index("products")
        return {"message": "Index cleared"}
    except Exception as e:
        logger.error(f"Error clearing index: {e}")
        raise HTTPException(
            status_code=500, detail="An error occurred while clearing index"
        ) from e


@router.get("/search/delete-index")
async def config_delete_index() -> dict:
    """
    Drop the products index in Meilisearch.
    """
    try:
        delete_index("products")
        return {"message": "Index dropping"}
    except Exception as e:
        logger.error(f"Error dropping index: {e}")
        raise HTTPException(
            status_code=500, detail="An error occurred while dropping index"
        ) from e


def prepare_product_data_for_indexing(product: Product) -> dict:
    product_dict = product.dict()
    product_dict["collections"] = [
        collection.name for collection in product.collections
    ]
    product_dict["brands"] = [brand.name for brand in product.brands]
    product_dict["categories"] = [category.name for category in product.categories]
    product_dict["images"] = [image.image for image in product.images]
    product_dict["variants"] = [variant.dict() for variant in product.variants]

    return product_dict

async def index_products(products, cache: CacheService):
    """
    Re-index all products in the database to Meilisearch.
    """
    try:
        # products = await db.product.find_many()
        logger.info("Starting re-indexing..........")

        # Prepare the documents for Meilisearch
        documents = []
        for product in products:
            product_dict = prepare_product_data_for_indexing(product)
            documents.append(product_dict)

        # Add all documents to the 'products' index
        add_documents_to_index(index_name="products", documents=documents)

        # Clear all product-related cache
        # cache.invalidate("product")
        # cache.invalidate("products")

        logger.info(f"Reindexed {len(documents)} products successfully.")
    except Exception as e:
        logger.error(f"Error during product reindexing: {e}")
