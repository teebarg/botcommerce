from io import BytesIO
from typing import Annotated, Any

from services.meilisearch import add_documents_to_index, delete_document, get_or_create_index, search_documents, update_document
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


@router.get(
    "/",
    response_model=Any,
)
async def index(
    query: str = "",
    tag: str = "",
    collections: str = Query(default=""),
    maxPrice: int = Query(default=1000000, gt=0),
    minPrice: int = Query(default=1, gt=0),
    page: int = Query(default=1, gt=0),
    per_page: int = Query(default=20, le=100),
) -> Any:
    """
    Retrieve products using Meilisearch.
    """
    filters = []
    if tag:
        filters.append(f"tag = '{tag}'")
    if collections:
        filters.append(f"collections IN [{collections}]")
    if minPrice and maxPrice:
        filters.append(f"price >= {minPrice} AND price <= {maxPrice}")

    search_params = {
        "limit": per_page,
        "offset": (page - 1) * per_page,
    }

    if filters:
        search_params["filter"] = " AND ".join(filters)

    search_results = search_documents(
        index_name="products",
        query=query,
        **search_params
    )

    total_count = search_results["estimatedTotalHits"]
    total_pages = (total_count // per_page) + (total_count % per_page > 0)

    return {"products": search_results["hits"], "page": page, "per_page": per_page, "total_count": total_count, "total_pages": total_pages}



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
        # Prepare product data for Meilisearch indexing
        product_data = prepare_product_data_for_indexing(db_product)

        update_document(index_name="products", document=product_data)
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


@router.post("/export")
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

        return {"message": "Data Export successful", "file_url": file_url}
    except Exception as e:
        logger.error(f"Export products error: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


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

        file_name = f"{id}.jpeg"
        file_path = f"products/{file_name}"

        blob = bucket.blob(file_path)
        blob.upload_from_file(BytesIO(contents), content_type=file.content_type)

        # Generate a signed URL for the uploaded file
        file_url = blob.generate_signed_url(
            version="v4",
            expiration=datetime.timedelta(minutes=15),
            method="GET"
        )

        if product := crud.product.get(db=db, id=id):
            # Prepare the document with updated image URL
            updated_document = {
                "id": id,
                "image": file_url
            }

            # Update the document in the 'products' index
            update_document("products", updated_document)

            # Return the updated product
            return crud.product.update(
                db=db, db_obj=product, obj_in={"image": file_url}
            )

        raise HTTPException(status_code=404, detail="Product not found.")
    except Exception as e:
        logger.error(f"{e}")
        raise HTTPException(
            status_code=500, detail=f"Error while uploading product image. {e}"
        ) from e


@router.post("/reindex", dependencies=[Depends(deps.get_current_active_superuser)], response_model=Message)
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
    db: SessionDep,
    attributes: list[str],
):
    """
    Configure filterable attributes for the products index in Meilisearch.
    """
    try:
        index = get_or_create_index("products")
        index.update_filterable_attributes(attributes)

        logger.info(f"Updated filterable attributes: {attributes}")
        return Message(message=f"Filterable attributes updated successfully: {attributes}")
    except Exception as e:
        logger.error(f"Error updating filterable attributes: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while updating filterable attributes."
        )


@router.get("/search/filterable-attributes", response_model=list[str])
async def get_filterable_attributes():
    """
    Get the current filterable attributes for the products index in Meilisearch.
    """
    try:
        index = get_or_create_index("products")
        filterable_attributes = index.get_filterable_attributes()

        logger.info(f"Retrieved filterable attributes: {filterable_attributes}")
        return filterable_attributes
    except Exception as e:
        logger.error(f"Error retrieving filterable attributes: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while retrieving filterable attributes."
        )

def prepare_product_data_for_indexing(product: Product) -> dict:
    product_dict = product.dict()
    product_dict['collections'] = [collection.name for collection in product.collections]
    return product_dict