from typing import Annotated, Any

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    HTTPException,
    Query,
    UploadFile
)
from app.core.deps import (
    CurrentUser,
    get_current_user,
    meilisearch_client
)
from app.core.logging import logger
from app.core.utils import slugify, url_to_list
from app.models.product import Product, Products, SearchProducts
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
    update_document,
)
from app.services.run_sheet import generate_excel_file, process_products
from app.prisma_client import prisma as db
from math import ceil
from prisma.enums import ProductStatus
from pydantic import BaseModel
from app.core.storage import upload
from app.api.routes.websocket import manager
from app.services.activity import log_activity
from app.core.deps import supabase

# Create a router for products
router = APIRouter()


@router.get("/landing-products")
async def get_landing_products():
    """
    Retrieve multiple product categories in a single request.
    """
    result = {}

    for product_type in ["trending", "latest", "featured"]:
        filters = [f"collections IN [{product_type}]"]
        search_params = {
            "limit": 6 if product_type == "featured" else 4,
            "offset": 0,
            "sort": ["created_at:desc"],
            "filter": " AND ".join(filters) if filters else None,
        }

        try:
            search_results = meilisearch_client.index('products').search(
                "",
                {
                    **search_params
                }
            )
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Error searching products: {str(e)}"
            )
        result[product_type] = search_results["hits"]

    return result


@router.post("/export")
async def export_products(
    current_user: CurrentUser,
    background_tasks: BackgroundTasks,
) -> Any:
    try:
        # Define the background task
        async def run_task():
            download_url = await generate_excel_file(email=current_user.email)

            # Log the activity
            await log_activity(
                user_id=current_user.id,
                activity_type="PRODUCT_EXPORT",
                description="Exported products to Excel",
                action_download_url=download_url
            )

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
            # "reviews": {"include": {"user": True}},
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
async def search(
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
        filters.append(f"price >= {min_price} AND price <= {max_price}")

    search_params = {
        "limit": limit,
        "offset": (page - 1) * limit,
        "sort": [sort],
        "facets": ["brand", "categories", "collections"],
    }

    if filters:
        search_params["filter"] = " AND ".join(filters)

    try:
        search_results = meilisearch_client.index('products').search(
            search,
            {
                **search_params
            }
        )
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
async def create_product(product: ProductCreate):
    slugified_name = slugify(product.name)
    sku = product.sku or f"SK{slugified_name}"

    data = {
        "name": product.name,
        "slug": slugified_name,
        "sku": sku,
        "description": product.description,
        "price": product.price or 0,
        "old_price": product.old_price or 0,
        "status": product.status or ProductStatus.IN_STOCK,
        "brand": {"connect": {"id": product.brand_id}},
    }

    # Prepare category connections if provided
    if product.category_ids:
        category_connect = [{"id": id} for id in product.category_ids]
        data["categories"] = {"connect": category_connect}

    # Prepare collection connections if provided
    if product.collection_ids:
        collection_connect = [{"id": id} for id in product.collection_ids]
        data["collections"] = {"connect": collection_connect}

    # Prepare tag connections if provided
    if product.tags_ids:
        tag_connect = [{"id": id} for id in product.tags_ids]
        data["tags"] = {"connect": tag_connect}

    # Create product with all related data
    created_product = await db.product.create(
        data=data,
        include={
            "categories": True,
            "brand": True,
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

    return created_product


@router.get("/{slug}")
async def read(slug: str):
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


@router.get("/{id}/reviews")
async def read_reviews(id: int):
    """
    Get a specific product reviews with Redis caching.
    """
    return await db.review.find_many(where={"product_id": id})


@router.put("/{id}")
async def update_product(id: int, product: ProductUpdate, background_tasks: BackgroundTasks):
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

    if product.price is not None:
        update_data["price"] = product.price

    if product.old_price is not None:
        update_data["old_price"] = product.old_price

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
    if product.brand_id is not None:
        update_data["brand"] = {"connect": {"id": product.brand_id}}

    # Update the product
    updated_product = await db.product.update(
        where={"id": id},
        data=update_data,
        include={
            "categories": True,
            "brand": True,
            "collections": True,
            "tags": True,
            "variants": True,
            "images": True
        }
    )

    try:
        # Define the background task
        async def update_task():
            logger.info("Updating product in Meilisearch")
            # Prepare product data for Meilisearch indexing
            product_data = prepare_product_data_for_indexing(updated_product)

            update_document(index_name="products", document=product_data)

        background_tasks.add_task(update_task)
        return updated_product
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400,
            detail=f"{e}",
        ) from e


@router.delete("/{id}", dependencies=[Depends(get_current_user)])
async def delete_product(id: int) -> Message:
    """
    Delete a product.
    """
    # Delete related data first due to foreign key constraints
    await db.productimage.delete_many(where={"product_id": id})
    await db.review.delete_many(where={"product_id": id})
    await db.productvariant.delete_many(where={"product_id": id})

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
    created_variant = await db.productvariant.create(
        data={
            "name": variant.name,
            "slug": slug,
            "sku": variant.sku or f"SK{slug}",
            "image": variant.image,
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
    existing_variant = await db.productvariant.find_unique(where={"id": variant_id})
    if not existing_variant:
        raise HTTPException(status_code=404, detail="Variant not found")

    # Prepare update data
    update_data = {}

    if variant.name:
        update_data["name"] = variant.name
        slug = slugify(variant.name)
        update_data["slug"] = slug

    if variant.sku:
        update_data["sku"] = variant.sku

    if variant.price:
        update_data["price"] = variant.price

    if variant.inventory is not None:
        update_data["inventory"] = variant.inventory

    if variant.status:
        update_data["status"] = variant.status

    # Update the variant
    updated_variant = await db.productvariant.update(
        where={"id": variant_id},
        data=update_data
    )

    return updated_variant


@router.delete("/variants/{variant_id}")
async def delete_variant(variant_id: int):
    # Delete the variant
    return await db.productvariant.delete(where={"id": variant_id})


class ImageUpload(BaseModel):
    file: str  # Base64 encoded file
    file_name: str
    content_type: str


@router.patch("/{id}/image")
async def add_image(id: int, image_data: ImageUpload) -> Product:
    """
    Add an image to a product.
    """
    product = await db.product.find_unique(
        where={"id": id}
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        image_url = upload(bucket="product-images", data=image_data)

        # Update product with new image URL
        return await db.product.update(
            where={"id": id},
            data={"image": image_url}
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload image: {str(e)}"
        )


@router.post("/{id}/images")
async def upload_images(id: int, image_data: ImageUpload):
    """
    Upload images to a product.
    """
    # Check if product exists
    product = await db.product.find_unique(where={"id": id}, include={"images": True})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    image_url = upload(bucket="product-images", data=image_data)

    # Create image record in database
    image = await db.productimage.create(
        data={
            "image": image_url,
            "product_id": product.id,
            "order": len(product.images)
        }
    )

    return image


@router.delete("/{id}/image")
async def delete_image(id: int):
    """
    Delete an image from a product.
    """
    # Check if product exists
    product = await db.product.find_unique(where={"id": id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        # Extract file path from URL
        file_path = product.image.split(
            "/storage/v1/object/public/product-images/")[1]

        # Delete from Supabase
        result = supabase.storage.from_("product-images").remove([file_path])
        logger.info(f"Delete result: {result}")
    except Exception as e:
        logger.error(f"Error deleting image: {e}")

    # Delete from database
    await db.product.update(where={"id": id}, data={"image": None})

    return {"success": True}


@router.delete("/{id}/images/{image_id}")
async def delete_images(id: int, image_id: int):
    """
    Delete an image from a product images.
    """
    # Check if product exists
    product = await db.product.find_unique(where={"id": id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Get image details
    image = await db.productimage.find_unique(where={"id": image_id})
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    # Extract file path from URL
    file_path = image.image.split(
        "/storage/v1/object/public/product-images/")[1]

    # Delete from Supabase
    result = supabase.storage.from_("product-images").remove([file_path])
    logger.info(f"Delete result: {result}")

    # Delete from database
    await db.productimage.delete(where={"id": image_id})

    # Reorder images
    images = await db.productimage.find_many(where={"product_id": id}, order={"order": "asc"})
    for index, image in enumerate(images):
        await db.productimage.update(
            where={"id": image.id},
            data={"order": index}
        )

    return {"success": True}


@router.post("/upload-products/")
async def upload_products(
    user: CurrentUser,
    file: Annotated[UploadFile, File()],
    background_tasks: BackgroundTasks,
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
    async def update_task():
        logger.info("Starting product upload processing...")
        try:
            await process_products(file_content=contents, content_type=content_type, user_id=user.id)

            products = await db.product.find_many(
                include={
                    "variants": True,
                    "categories": True,
                    "collections": True,
                    "brand": True,
                    "images": True,
                }
            )

            # Re-index
            await index_products(products=products)
            await manager.broadcast(
                id=str(user.id),
                data={
                    "status": "completed",
                    "total_rows": len(products),
                    "processed_rows": len(products),
                },
                type="sheet-processor",
            )

            # Log the activity
            await log_activity(
                user_id=user.id,
                activity_type="PRODUCT_UPLOAD",
                description=f"Uploaded products from file: {file.filename}",
                is_success=True
            )
        except Exception as e:
            logger.error(f"Error processing data from file: {e}")
            # Log failed activity
            await log_activity(
                user_id=user.id,
                activity_type="PRODUCT_UPLOAD",
                description=f"Failed to upload products from file: {file.filename}",
                is_success=False
            )

    background_tasks.add_task(update_task)

    return {"message": "Upload started"}


@router.post("/reindex", dependencies=[], response_model=Message)
async def reindex_products(background_tasks: BackgroundTasks):
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
                "brand": True,
                "images": True,
                # "reviews": { "include": { "user": True } },
            }
        )
        # Add the task to background tasks
        background_tasks.add_task(index_products, products)

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
            ["brand", "categories", "collections", "name", "price"]
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
    if product.brand:
        product_dict["brand"] = product.brand.name
    product_dict["categories"] = [
        category.name for category in product.categories]
    product_dict["images"] = [image.image for image in product.images]
    product_dict["variants"] = [variant.dict() for variant in product.variants]

    return product_dict


async def index_products(products):
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

        logger.info(f"Reindexed {len(documents)} products successfully.")
    except Exception as e:
        logger.error(f"Error during product re-indexing: {e}")


@router.patch("/{id}/images/reorder")
async def reorder_images(id: int, image_ids: list[int]):
    """
    Reorder product images.
    """
    # Check if product exists
    product = await db.product.find_unique(where={"id": id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Update image order
    for index, image_id in enumerate(image_ids):
        await db.productimage.update(
            where={"id": image_id},
            data={"order": index}
        )

    products = await db.product.find_many(
        include={
            "variants": True,
            "categories": True,
            "collections": True,
            "brand": True,
            "images": True,
        }
    )

    # Re-index
    await index_products(products=products)

    return {"success": True}
