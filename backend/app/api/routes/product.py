import asyncio
import base64
from typing import Annotated, Any
import uuid

# from app.core.db import PrismaDb
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
    Storage,
    get_current_user,
)
from app.core.logging import logger
from app.core.utils import slugify, url_to_list
from app.models.product import Product, Products
from app.models.reviews import  Reviews
from app.models.message import Message
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
from prisma.models import Product, ProductVariant, ProductImage, Review
from supabase import create_client, Client
from app.core.config import settings
from app.prisma_client import prisma as db

# Initialize Supabase client
supabase_url = settings.SUPABASE_URL
supabase_key = settings.SUPABASE_KEY
supabase: Client = create_client(supabase_url, supabase_key)

# Create a router for products
router = APIRouter()


@router.post("/export")
async def export_products(
    current_user: CurrentUser,
    bucket: Storage,
    background_tasks: BackgroundTasks,
) -> Any:
    try:
        # Define the background task
        def run_task():
            download_url = asyncio.run(
                generate_excel_file(bucket=bucket, email=current_user.email)
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
@cache(key="products")
async def index(
    search: str = "",
    sort: str = "created_at:desc",
    brands: str = Query(default=""),
    categories: str = Query(default=""),
    collections: str = Query(default=""),
    maxPrice: int = Query(default=1000000, gt=0),
    minPrice: int = Query(default=1, gt=0),
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
) -> Products:
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


# @router.post("/")
# async def create(*, db: SessionDep, product_in: ProductCreate, cache: CacheService) -> ProductPublic:
#     """
#     Create new product.
#     """
#     product = crud.product.get_by_key(db=db, value=product_in.name)
#     if product:
#         raise HTTPException(
#             status_code=400,
#             detail="The product already exists in the system.",
#         )

#     try:
#         product = crud.product.create(db=db, obj_in=product_in)
#         # Create a dictionary with product data and collection names
#         product_data = prepare_product_data_for_indexing(product)

#         add_documents_to_index(index_name="products", documents=[product_data])
#         cache.invalidate("products")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e)) from e
#     return product


@router.post("/")
async def create_product(product: ProductCreate):
    slugified_name = slugify(product.name)
    sku = product.sku or f"SK{slugified_name}"

    # Prepare category connections if provided
    category_connect = None
    if product.category_ids:
        category_connect = [{"id": id} for id in product.category_ids]

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

    # Prepare images if provided
    images_create = None
    if product.images:
        images_create = [{"url": str(url)} for url in product.images]

    # Create product with all related data
    created_product = await db.product.create(
        data={
            "name": product.name,
            "slug": slugified_name,
            "sku": sku,
            "description": product.description,
            "categories": {"connect": category_connect} if category_connect else None,
            "variants": {"create": variants_create} if variants_create else None,
            "images": {"create": images_create} if images_create else None
        },
        include={
            "categories": True,
            "variants": True,
            "images": True
        }
    )

    try:
        # Create a dictionary with product data and collection names
        product_data = prepare_product_data_for_indexing(created_product)

        add_documents_to_index(index_name="products", documents=[product_data])
        # cache.invalidate("products")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    # return product

    return created_product


@router.get("/{slug}")
# @cache(key="product", hash=False)
async def read(slug: str):
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
    # try:
    #     product = crud.product.get(db=db, id=id)
    #     if not product:
    #         raise HTTPException(status_code=404, detail="Product not found")
    #     reviews = crud.product.reviews(db=db, product_id=id)
    #     return Reviews(reviews=reviews)
    # except Exception as e:
    #     raise HTTPException(status_code=400, detail=f"{e}")



# @router.patch("/{id}", dependencies=[Depends(get_current_user)])
# async def update(
#     *,
#     db: SessionDep,
#     id: int,
#     product_in: ProductUpdate,
#     background_tasks: BackgroundTasks,
#     cache: CacheService,
# ) -> ProductPublic:
#     """
#     Update a product.
#     """
#     product = crud.product.get(db=db, id=id)
#     if not product:
#         raise HTTPException(
#             status_code=404,
#             detail="Product not found",
#         )

#     try:
#         product = crud.product.update(db=db, db_obj=product, obj_in=product_in)
#         # Invalidate cache
#         cache.delete(f"product:{product.slug}")
#         cache.delete(f"product:{id}")
#         cache.invalidate("products")

#         # Define the background task
#         def update_task(product: Product):
#             # Prepare product data for Meilisearch indexing
#             product_data = prepare_product_data_for_indexing(product)

#             update_document(index_name="products", document=product_data)

#         background_tasks.add_task(update_task, product=product)
#         return product
#     except IntegrityError as e:
#         logger.error(f"Error updating collection, {e.orig.pgerror}")
#         raise HTTPException(status_code=422, detail=str(e.orig.pgerror)) from e
#     except Exception as e:
#         logger.error(e)
#         raise HTTPException(
#             status_code=400,
#             detail=f"{e}",
#         ) from e


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

    if product.description is not None:
        update_data["description"] = product.description

    # Handle category updates if provided
    if product.category_ids is not None:
        category_ids = [{"id": id} for id in product.category_ids]
        update_data["categories"] = {"set": category_ids}

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

    try:
        # Define the background task
        def update_task(product: Product):
            # Prepare product data for Meilisearch indexing
            product_data = prepare_product_data_for_indexing(product)

            update_document(index_name="products", document=product_data)

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

# @router.delete("/{id}")
# async def delete(id: int, db: SessionDep, cache: CacheService,) -> Message:
#     """
#     Delete a product.
#     """
#     product = crud.product.get(db=db, id=id)
#     if not product:
#         raise HTTPException(status_code=404, detail="Product not found")
#     crud.product.remove(db=db, id=id)
#     try:
#         delete_document(index_name="products", document_id=str(id))
#         # Invalidate cache
#         cache.delete(f"product:{product.slug}")
#         cache.delete(f"product:{id}")
#         cache.invalidate("products")
#     except Exception as e:
#         logger.error(f"Error deleting document from Meilisearch: {e}")
#     return Message(message="Product deleted successfully")


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

    # Upload file to Supabase Storage
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

    # Delete from Supabase Storage
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
    # db: PrismaDb,
    user: CurrentUser,
    file: Annotated[UploadFile, File()],
    background_tasks: BackgroundTasks,
    cache: CacheService,
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
    def update_task(products):
        asyncio.run(
            process_products(
                file_content=contents, content_type=content_type, user_id=user.id
            )
        )

        # Clear all product-related cache
        cache.invalidate("product")
        cache.invalidate("products")

        # Re-index
        asyncio.run(
            index_products(products=products, cache=cache)
        )


        # crud.activities.create_product_upload_activity(
        #     db=db, user_id=user.id, filename=file.filename
        # )

    products = await db.product.find_many(
        include={
            # "variants": True,
            "categories": True,
            "collections": True,
            "brands": True,
            "images": True,
            # "reviews": { "include": { "user": True } },
        }
    )

    background_tasks.add_task(update_task, products)

    return {"message": "Upload started"}


# Upload Image
# @router.patch("/{id}/image")
# async def upload_product_image(
#     id: str,
#     file: Annotated[UploadFile, File()],
#     db: SessionDep,
#     bucket: Storage,
#     cache: CacheService
# ):
#     """
#     Upload a product image.
#     """
#     try:
#         await validate_file(file=file)
#         contents = await file.read()

#         file_name = f"product_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.jpeg"
#         file_path = f"products/{file_name}"

#         blob = bucket.blob(file_path)
#         blob.upload_from_file(BytesIO(contents), content_type=file.content_type)
#         blob.make_public()

#         # Use the public URL instead of a signed URL
#         file_url = blob.public_url

#         if product := crud.product.get(db=db, id=id):
#             product = crud.product.update(
#                 db=db, db_obj=product, obj_in={"image": file_url}
#             )

#             # Prepare product data for Meilisearch indexing
#             product_data = prepare_product_data_for_indexing(product)

#             update_document(index_name="products", document=product_data)

#             # Invalidate cache
#             cache.delete(f"product:{product.slug}")
#             cache.delete(f"product:{product.id}")
#             cache.invalidate("products")

#             # Return the updated product
#             return product

#         raise HTTPException(status_code=404, detail="Product not found.")
#     except Exception as e:
#         logger.error(f"Error uploading product image: {e}")
#         raise HTTPException(
#             status_code=500, detail=f"Error while uploading product image: {str(e)}"
#         ) from e


@router.post("/reindex", dependencies=[], response_model=Message)
async def reindex_products(db, cache: CacheService, background_tasks: BackgroundTasks):
    """
    Re-index all products in the database to Meilisearch.
    This operation is performed asynchronously in the background.
    """
    try:
        products = await db.product.find_many(
            include={
                # "variants": True,
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
        cache.invalidate("product")
        cache.invalidate("products")

        logger.info(f"Reindexed {len(documents)} products successfully.")
    except Exception as e:
        logger.error(f"Error during product reindexing: {e}")
