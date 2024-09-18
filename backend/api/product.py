import datetime
from io import BytesIO
from typing import Annotated, Any

from services.meilisearch import add_documents_to_index, clear_index, delete_document, delete_index, get_or_create_index, search_documents, update_document
from fastapi import (
    APIRouter,
    BackgroundTasks,
    File,
    Form,
    HTTPException,
    Query,
    UploadFile,
    Depends
)
from sqlalchemy.sql import text

import crud
from core import deps
from core.deps import (
    SessionDep,
)
from core.logging import logger
from models.generic import Product, ProductPublic, Products
from models.message import Message
from models.product import (
    ProductCreate,
    ProductUpdate,
)
from services.export import export, process_file, validate_file

# Create a router for products
router = APIRouter()


@router.get("/export")
async def export_products(
    current_user: deps.CurrentUser, db: SessionDep, bucket: deps.Storage
) -> Any:
    try:
        statement = "SELECT name, slug, description, price, old_price FROM product;"
        products = db.exec(text(statement))

        file_url = await export(
            columns=["name", "slug", "description", "price", "old_price"],
            data=products,
            name="Product",
            bucket=bucket,
            email=current_user.email,
        )

        return {"message": "Data Export successful. An email with the file URL has been sent.", "file_url": file_url}
    except Exception as e:
        logger.error(f"Export products error: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get(
    "/",
    response_model=Any,
)
async def index(
    search: str = "",
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
    if collections:
        filters.append(f"collections IN [{collections}]")
    if minPrice and maxPrice:
        filters.append(f"price >= {minPrice} AND price <= {maxPrice}")

    search_params = {
        "limit": limit,
        "offset": (page - 1) * limit,
        "sort": ["created_at:desc"],  # Sort by latest (assuming there's a 'created_at' field)
    }

    if filters:
        search_params["filter"] = " AND ".join(filters)

    search_results = search_documents(
        index_name="products",
        query=search,
        **search_params
    )

    total_count = search_results["estimatedTotalHits"]
    total_pages = (total_count // limit) + (total_count % limit > 0)

    return {"products": search_results["hits"], "page": page, "limit": limit, "total_count": total_count, "total_pages": total_pages}


@router.post("/search", response_model=Any)
async def search_products(search_params: dict) -> Any:
    """
    Search products using Meilisearch, sorted by relevance.
    """

    print(search_params)
    search = search_params.get("search", "")
    collections = search_params.get("collections", [])
    minPrice = search_params.get("min_price", 1)
    maxPrice = search_params.get("max_price", 1000000)
    page = int(search_params.get("page", 1))
    limit = int(search_params.get("limit", 20))
    sort = search_params.get("sort", "created_at:desc")

    filters = []
    if collections:
        filters.append(f"collections IN [{','.join(collections)}]")
    if minPrice and maxPrice:
        filters.append(f"price >= {minPrice} AND price <= {maxPrice}")

    search_params = {
        "limit": limit,
        "offset": (page - 1) * limit,
        "sort": [sort],  # Sort by specified field
    }

    if filters:
        search_params["filter"] = " AND ".join(filters)

    search_results = search_documents(
        index_name="products",
        query=search,
        **search_params
    )

    total_count = search_results["estimatedTotalHits"]
    total_pages = (total_count // limit) + (total_count % limit > 0)

    return {"products": search_results["hits"], "page": page, "limit": limit, "total_count": total_count, "total_pages": total_pages}



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
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    return product


@router.get("/{slug}", response_model=ProductPublic)
def read(slug: str, db: SessionDep) -> ProductPublic:
    """
    Get a specific product by slug.
    """
    if product := crud.product.get_by_key(db=db, key="slug", value=slug):
        return product
    else:
        raise HTTPException(status_code=404, detail="Product not found")


@router.patch(
    "/{id}",
    response_model=ProductPublic,
)
def update(
    *,
    db: SessionDep,
    id: int,
    product_in: ProductUpdate,
    background_tasks: BackgroundTasks,
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
    
    try:
        # Define the background task
        def update_task(db_product):
            # Prepare product data for Meilisearch indexing
            product_data = prepare_product_data_for_indexing(db_product)

            update_document(index_name="products", document=product_data)

        background_tasks.add_task(update_task, db_product=db_product)
        return db_product
    except Exception as e:
        logger.error(f"Error updating document in Meilisearch: {e}")
    return db_product


@router.delete("/{id}")
def delete(db: SessionDep, id: int) -> Message:
    """
    Delete a product.
    """
    product = crud.product.get(db=db, id=id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    crud.product.remove(db=db, id=id)
    try:
        delete_document(index_name="products", document_id=str(id))
    except Exception as e:
        logger.error(f"Error deleting document from Meilisearch: {e}")
    return Message(message="Product deleted successfully")


@router.post("/excel/{id}")
async def upload_products(
    file: Annotated[UploadFile, File()],
    batch: Annotated[str, Form()],
    id: str,
    db: SessionDep,
    background_tasks: BackgroundTasks,
):
    await validate_file(file=file)

    contents = await file.read()
    background_tasks.add_task(process_file, contents, id, db, crud.product.bulk_upload)
    return {"batch": batch, "message": "File upload started"}


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
async def reindex_products(
    db: SessionDep,
    background_tasks: BackgroundTasks
):
    """
    Re-index all products in the database to Meilisearch.
    This operation is performed asynchronously in the background.
    """
    try:
        # Define the background task
        def reindex_task():
            products = crud.product.all(db=db)

            # Prepare the documents for Meilisearch
            documents = []
            for product in products:
                product_dict = prepare_product_data_for_indexing(product)
                documents.append(product_dict)
                
            # Add all documents to the 'products' index
            add_documents_to_index(index_name="products", documents=documents)

            logger.info(f"Reindexed {len(documents)} products successfully.")

        # Add the task to background tasks
        background_tasks.add_task(reindex_task)

        return Message(message="Product reindexing started. This may take a while.")
    except Exception as e:
        logger.error(f"Error during product reindexing: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while starting the reindexing process."
        )


@router.post("/configure-filterable-attributes", response_model=Message)
async def configure_filterable_attributes(
    attributes: list[str],
):
    """
    Configure filterable attributes for the products index in Meilisearch.
    """
    try:
        index = get_or_create_index("products")
        # Update the filterable attributes
        index.update_filterable_attributes(["collections", "price"])
        # Update the sortable attributes
        index.update_sortable_attributes(['created_at', 'price'])

        logger.info(f"Updated filterable attributes: {attributes}")
        return Message(message=f"Filterable attributes updated successfully: {attributes}")
    except Exception as e:
        logger.error(f"Error updating filterable attributes: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while updating filterable attributes."
        )

    
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
            status_code=500,
            detail="An error occurred while clearing index"
        )
    

@router.get("/search/delete-index", response_model=dict)
async def config_delete_index():
    """
    Drop the products index in Meilisearch.
    """
    try:
        delete_index("products")
        return {"message": "Index dropping"}
    except Exception as e:
        logger.error(f"Error dropping index: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while dropping index"
        )

def prepare_product_data_for_indexing(product: Product) -> dict:
    product_dict = product.dict()
    product_dict['collections'] = [collection.name for collection in product.collections]
    return product_dict