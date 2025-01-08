import asyncio
import datetime
from io import BytesIO
import json
from typing import Annotated, Any

from fastapi import (
    APIRouter,
    BackgroundTasks,
    File,
    HTTPException,
    Query,
    UploadFile,
)

from app import crud
from app.core import deps
from app.core.deps import (
    CurrentUser,
    SessionDep,
)
from app.core.logging import logger
from app.core.utils import url_to_list
from app.models.generic import Product, ProductPublic
from app.models.message import Message
from app.models.product import (
    ProductCreate,
    ProductSearch,
    ProductUpdate,
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

# Create a router for products
router = APIRouter()


@router.get("/export")
async def export_products(
    current_user: deps.CurrentUser,
    db: SessionDep,
    bucket: deps.Storage,
    background_tasks: BackgroundTasks,
) -> Any:
    try:
        # Define the background task
        def run_task():
            download_url = asyncio.run(
                generate_excel_file(bucket=bucket, email=current_user.email)
            )

            crud.activities.create_product_export_activity(
                db=db, user_id=current_user.id, download_url=download_url
            )

        background_tasks.add_task(run_task)

        return {
            "message": "Data Export successful. An email with the file URL has been sent."
        }
    except Exception as e:
        logger.error(f"Export products error: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/")
async def index(
    service: deps.SearchService,
    search: str = "",
    categories: str = Query(default=""),
    collections: str = Query(default=""),
    maxPrice: int = Query(default=1000000, gt=0),
    minPrice: int = Query(default=1, gt=0),
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> Any:
    """
    Retrieve products using Meilisearch, sorted by latest.
    """
    filters = []
    # if tag:
    #     filters.append(f"tag = '{tag}'")
    if categories:
        filters.append(f"categories IN {url_to_list(categories)}")
    if collections:
        filters.append(f"collections IN [{collections}]")
    if minPrice and maxPrice:
        filters.append(f"price >= {minPrice} AND price <= {maxPrice}")

    search_params = {
        "limit": limit,
        "offset": (page - 1) * limit,
        "sort": [
            "created_at:desc"
        ],  # Sort by latest (assuming there's a 'created_at' field)
    }

    if filters:
        search_params["filter"] = " AND ".join(filters)

    search_results = await service.search_products(
        query=search, filters=search_params
    )

    total_count = search_results["estimatedTotalHits"]
    total_pages = (total_count // limit) + (total_count % limit > 0)

    return {
        "products": search_results["hits"],
        "page": page,
        "limit": limit,
        "total_count": total_count,
        "total_pages": total_pages,
    }


@router.post("/search")
async def search_products(params: ProductSearch, service: deps.SearchService) -> Any:
    """
    Search products using Meilisearch with Redis caching, sorted by relevance.
    """
    categories = params.categories
    collections = params.collections
    min_price = params.min_price
    max_price = params.max_price
    limit = params.limit
    page = params.page
    sort = params.sort

    filters = []
    if categories:
        filters.append(f"categories IN {url_to_list(categories)}")
    if collections:
        filters.append(f"collections IN {url_to_list(collections)}")
    if min_price and max_price:
        filters.append(f"price >= {min_price} AND price <= {max_price}")

    search_params = {
        "limit": limit,
        "offset": (page - 1) * limit,
        "sort": [sort],  # Sort by specified field
        "facets": ['categories', 'collections'],
    }

    if filters:
        search_params["filter"] = " AND ".join(filters)

    try:
        search_results = await service.search_products(
            query=params.query, filters=search_params
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
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
def create(*, db: SessionDep, product_in: ProductCreate) -> ProductPublic:
    """
    Create new product.
    """
    product = crud.product.get_by_key(db=db, value=product_in.name)
    if product:
        raise HTTPException(
            status_code=400,
            detail="The product already exists in the system.",
        )

    product = crud.product.create(db=db, obj_in=product_in)
    try:
        # Create a dictionary with product data and collection names
        product_data = prepare_product_data_for_indexing(product)

        add_documents_to_index(index_name="products", documents=[product_data])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    return product


@router.get("/{slug}")
async def read(slug: str, db: SessionDep, redis: deps.CacheService) -> ProductPublic:
    """
    Get a specific product by slug with Redis caching.
    """
    cache_key = f"product:{slug}"

    # Try to get from cache first
    cached_data = redis.get(cache_key)
    if cached_data:
        return ProductPublic(**json.loads(cached_data))

    product = crud.product.get_by_key(db=db, key="slug", value=slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Cache the result
    product_public = ProductPublic.model_validate(product)
    redis.set(cache_key, product_public.model_dump_json())

    return product


@router.patch("/{id}")
def update(
    *,
    db: SessionDep,
    id: int,
    product_in: ProductUpdate,
    background_tasks: BackgroundTasks,
    service: deps.SearchService,
    redis: deps.CacheService,
) -> ProductPublic:
    """
    Update a product.
    """
    db_product = crud.product.get(db=db, id=id)
    if not db_product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )
    db_product = crud.product.update(db=db, db_obj=db_product, obj_in=product_in)
    redis.delete(f"product:{db_product.slug}")
    redis.delete(f"product:{id}")

    try:
        # Define the background task
        def update_task(db_product: Product):
            # Prepare product data for Meilisearch indexing
            product_data = prepare_product_data_for_indexing(db_product)

            update_document(index_name="products", document=product_data)
            service.invalidate_product_cache(product_id=db_product.id)

        background_tasks.add_task(update_task, db_product=db_product)
        return db_product
    except Exception as e:
        logger.error(f"Error updating document in Meilisearch: {e}")
    return db_product


@router.delete("/{id}")
def delete(db: SessionDep, id: int, redis: deps.CacheService,) -> Message:
    """
    Delete a product.
    """
    product = crud.product.get(db=db, id=id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    crud.product.remove(db=db, id=id)
    try:
        delete_document(index_name="products", document_id=str(id))
        redis.delete(f"product:{product.slug}")
        redis.delete(f"product:{id}")
    except Exception as e:
        logger.error(f"Error deleting document from Meilisearch: {e}")
    return Message(message="Product deleted successfully")


@router.post("/upload-products/")
async def upload_products(
    db: SessionDep,
    user: CurrentUser,
    file: Annotated[UploadFile, File()],
    background_tasks: BackgroundTasks,
    redis: deps.CacheService,
):
    content_type = file.content_type

    if content_type not in [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
    ]:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only CSV/Excel files are supported.",
        )

    await validate_file(file=file)

    contents = await file.read()

    # Define the background task
    def update_task():
        asyncio.run(
            process_products(
                file_content=contents, content_type=content_type, user_id=user.id
            )
        )

        # Clear all product-related cache
        redis.delete_pattern("product:*")
        redis.delete_pattern("search:*")

        # Re-index
        index_products(db=db)

        crud.activities.create_product_upload_activity(
            db=db, user_id=user.id, filename=file.filename
        )

    background_tasks.add_task(update_task)

    return {"message": "Upload started"}


# Upload Image
@router.patch("/{id}/image", response_model=Any)
async def upload_product_image(
    id: str,
    file: Annotated[UploadFile, File()],
    db: SessionDep,
    bucket: deps.Storage,
):
    """
    Upload a product image.
    """
    try:
        await validate_file(file=file)
        contents = await file.read()

        file_name = f"product_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.jpeg"
        file_path = f"products/{file_name}"

        blob = bucket.blob(file_path)
        blob.upload_from_file(BytesIO(contents), content_type=file.content_type)
        blob.make_public()

        # Use the public URL instead of a signed URL
        file_url = blob.public_url

        if product := crud.product.get(db=db, id=id):
            product = crud.product.update(
                db=db, db_obj=product, obj_in={"image": file_url}
            )

            # Prepare product data for Meilisearch indexing
            product_data = prepare_product_data_for_indexing(product)

            update_document(index_name="products", document=product_data)

            # Return the updated product
            return product

        raise HTTPException(status_code=404, detail="Product not found.")
    except Exception as e:
        logger.error(f"Error uploading product image: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error while uploading product image: {str(e)}"
        ) from e


@router.post("/reindex", dependencies=[], response_model=Message)
async def reindex_products(db: SessionDep, background_tasks: BackgroundTasks):
    """
    Re-index all products in the database to Meilisearch.
    This operation is performed asynchronously in the background.
    """
    try:
        # Add the task to background tasks
        background_tasks.add_task(index_products, db)

        return Message(message="Product reindexing started. This may take a while.")
    except Exception as e:
        logger.error(f"Error during product reindexing: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while starting the reindexing process.",
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
            ["categories", "collections", "name", "price", "slug"]
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
    product_dict["categories"] = [category.name for category in product.categories]
    product_dict["images"] = [image.image for image in product.images]
    return product_dict

def index_products(db: SessionDep):
    """
    Re-index all products in the database to Meilisearch.
    """
    try:
        products = crud.product.all(db=db)
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
        logger.error(f"Error during product reindexing: {e}")
