import csv
import time
from datetime import datetime
from io import BytesIO
from typing import Any

from fastapi import (
    HTTPException,
)
from openpyxl import Workbook, load_workbook
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql import delete
from sqlmodel import Session, select

from app.api.routes.websocket import manager
from app.core.logging import logger
from app.core.utils import generate_data_export_email, send_email
from app.db.engine import engine
from app.models.product import (
    Product,
    ProductBrand,
    ProductCategory,
    ProductCollection,
    ProductImages,
)
from app.models.category import Category
from app.models.collection import Collection
from app.models.brand import Brand
from app.prisma_client import prisma
from app.core.config import settings


async def broadcast_channel(data, user_id: int):
    await manager.broadcast(
        id=str(user_id),
        data=data,
        type="sheet-processor",
    )


async def process_products(file_content, content_type: str, user_id: int):
    start_time = time.time()  # Start timing the process
    try:
        # Create a BytesIO stream from the file content
        file_stream = BytesIO(file_content)

        if content_type in [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/xlsx",
        ]:
            # Read Excel file using openpyxl
            workbook = load_workbook(file_stream)
            sheet = workbook.active
            rows = list(sheet.iter_rows(values_only=True))
            headers = rows[0]
            data_rows = rows[1:]

        elif content_type == "text/csv":
            # Read CSV file using csv module
            file_stream.seek(0)
            csv_reader = csv.reader(file_stream.decode("utf-8").splitlines())
            rows = list(csv_reader)
            headers = rows[0]
            data_rows = rows[1:]

        else:
            raise ValueError(
                "Unsupported file format. Please upload a CSV or Excel file."
            )

        # Batch size and iteration setup
        batch_size = 20
        num_batches = (len(data_rows) // batch_size) + 1
        # Track all product slugs from the sheet
        product_slugs_in_sheet = set()

        # Send WebSocket update
        await broadcast_channel(
            data={
                "total_rows": num_batches * batch_size,
                "processed_rows": 1,
                "status": "processing",
            },
            user_id=user_id,
        )

        for i in range(num_batches):
            batch = data_rows[i * batch_size : (i + 1) * batch_size]
            logger.info(f"Processing batch {i + 1}")

            # Extract and process the products
            products_to_create_or_update = []
            for row in batch:
                row_data = dict(zip(headers, row, strict=False))
                name = row_data.get("name", "")
                active = row_data.get("is_active", True)
                is_active = row_data.get("is_active", True)

                if isinstance(is_active, str):
                    is_active = True if active == "TRUE" else False

                product_data = {
                    "id": row_data.get("id", ""),
                    "name": name,
                    "slug": row_data.get("slug", name.lower().replace(" ", "-")),
                    "description": row_data.get("description", ""),
                    "price": int(row_data.get("price", 0)),
                    "old_price": int(row_data.get("old_price", 0)),
                    "inventory": row_data.get("inventory", 1),
                    "is_active": is_active,
                    "ratings": row_data.get("ratings", 4.7),
                    "image": row_data.get("image", ""),
                }

                brands = row_data.get("brands", "")
                categories = row_data.get("categories", "")
                collections = row_data.get("collections", "")
                images = row_data.get("images", "")
                product_slugs_in_sheet.add(product_data["slug"])

                # Add product data to be processed later
                products_to_create_or_update.append(
                    (product_data, brands, categories, collections, images)
                )

            # Process the batch
            await create_or_update_products_in_db(products_to_create_or_update)

            # Send WebSocket update
            await broadcast_channel(
                data={
                    "total_rows": num_batches * batch_size,
                    "processed_rows": (i + 1) * batch_size,
                    "status": "processing",
                },
                user_id=user_id,
            )

        # After processing, delete products not in the sheet
        await delete_products_not_in_sheet(
            product_slugs_in_sheet=product_slugs_in_sheet, user_id=user_id
        )

        logger.info("Sheet processed successfully")
        end_time = time.time()
        logger.info(
            f"Total processing time: {end_time - start_time:.2f} seconds"
        )  # Log total time
    except Exception as e:
        logger.error(f"An error occurred while processing. Error{e}")
        await manager.broadcast(
            id="sheet",
            data={
                "message": f"An error occurred while processing. Error{e}",
                "status": "error",
            },
            type="sheet-processor",
        )


async def create_or_update_products_in_db(products: list):
    with Session(engine) as session:
        try:
            # Collect all slugs first to minimize database queries
            all_slugs = [p[0]["slug"] for p in products]
            existing_products = {
                p.slug: p for p in session.exec(
                    select(Product).where(Product.slug.in_(all_slugs))
                ).all()
            }

            products_to_add = []
            for product_data, _brands, _categories, _collections, images in products:
                if product_data["slug"] in existing_products:
                    # Update existing product
                    existing_product = existing_products[product_data["slug"]]
                    for key, value in product_data.items():
                        if key != "id":
                            setattr(existing_product, key, value)
                else:
                    # Prepare new product for bulk insert
                    if "id" in product_data:
                        del product_data["id"]
                    products_to_add.append(Product(**product_data))

            # Bulk insert new products
            if products_to_add:
                session.add_all(products_to_add)

            session.commit()

            # Update related models in bulk
            await update_related_models(products, session)

        except SQLAlchemyError as e:
            session.rollback()
            logger.error(f"Error in batch update: {str(e)}")
            await manager.broadcast(
                id="sheet",
                data={
                    "message": f"Error processing product: {str(e)}",
                    "status": "error",
                },
                type="sheet-processor",
            )
            raise


async def update_related_models(products: list, session: Session):
    # Collect all slugs
    product_slugs = [p[0]["slug"] for p in products]

    # Fetch all products in one query
    products_map = {
        p.slug: p for p in session.exec(
            select(Product).where(Product.slug.in_(product_slugs))
        ).all()
    }

    # Prepare bulk operations
    brands_to_add = []
    categories_to_add = []
    collections_to_add = []
    images_to_add = []

    # Get all existing categories and collections upfront
    all_brands = {
        c.slug: c for c in session.exec(select(Brand)).all()
    }
    all_categories = {
        c.slug: c for c in session.exec(select(Category)).all()
    }
    all_collections = {
        c.slug: c for c in session.exec(select(Collection)).all()
    }

    for product_data, brands, categories, collections, images in products:
        product = products_map.get(product_data["slug"])
        if not product:
            continue

        # Delete existing relationships in bulk
        session.exec(delete(ProductBrand).where(ProductBrand.product_id == product.id))
        session.exec(delete(ProductCategory).where(ProductCategory.product_id == product.id))
        session.exec(delete(ProductCollection).where(ProductCollection.product_id == product.id))
        session.exec(delete(ProductImages).where(ProductImages.product_id == product.id))

        # Prepare new relationships for bulk insert
        if brands and isinstance(brands, str):
            for brand_slug in brands.split(","):
                brand_slug = brand_slug.strip()
                if brand := all_brands.get(brand_slug):
                    brands_to_add.append(
                        ProductBrand(product_id=product.id, brand_id=brand.id)
                    )

        if categories and isinstance(categories, str):
            for cat_slug in categories.split(","):
                cat_slug = cat_slug.strip()
                if category := all_categories.get(cat_slug):
                    categories_to_add.append(
                        ProductCategory(product_id=product.id, category_id=category.id)
                    )

        if collections and isinstance(collections, str):
            for coll_slug in collections.split(","):
                coll_slug = coll_slug.strip()
                if collection := all_collections.get(coll_slug):
                    collections_to_add.append(
                        ProductCollection(product_id=product.id, collection_id=collection.id)
                    )

        if images and isinstance(images, str):
            for image in images.split("|"):
                images_to_add.append(
                    ProductImages(product_id=product.id, image=image.strip())
                )

    # Bulk insert all relationships
    if brands_to_add:
        session.add_all(brands_to_add)
    if categories_to_add:
        session.add_all(categories_to_add)
    if collections_to_add:
        session.add_all(collections_to_add)
    if images_to_add:
        session.add_all(images_to_add)

    session.commit()


async def delete_products_not_in_sheet(product_slugs_in_sheet: set, user_id: int):
    try:
        with Session(engine) as session:
            # Query the database after all insertions and updates
            existing_slugs_in_db = set(session.exec(select(Product.slug)).all())

            # Remove products from the database that are not in the sheet
            slugs_to_remove = existing_slugs_in_db - product_slugs_in_sheet
            if slugs_to_remove:
                # First, delete associated records in related tables
                products_to_remove = session.exec(
                    select(Product).where(Product.slug.in_(slugs_to_remove))
                ).all()

                for product in products_to_remove:
                    session.exec(
                        delete(ProductBrand).where(
                            ProductBrand.product_id == product.id
                        )
                    )
                    session.exec(
                        delete(ProductCollection).where(
                            ProductCollection.product_id == product.id
                        )
                    )
                    session.exec(
                        delete(ProductCategory).where(
                            ProductCategory.product_id == product.id
                        )
                    )
                    session.exec(
                        delete(ProductImages).where(
                            ProductImages.product_id == product.id
                        )
                    )

                # Now delete the products
                session.exec(delete(Product).where(Product.slug.in_(slugs_to_remove)))
                session.commit()
                logger.info(
                    f"Successfully deleted {len(product_slugs_in_sheet)} products."
                )
            else:
                logger.info("No products to delete. All products are in the sheet.")

            await broadcast_channel(
                data={
                    "message": "Products successfully synced with the sheet",
                    "status": "completed",
                },
                user_id=user_id,
            )

    except SQLAlchemyError as e:
        logger.error(f"An error occurred while deleting products. Error {e}")
        await manager.broadcast(
            id="sheet",
            data={
                "message": f"An error occurred while deleting products. Error {e}",
                "status": "error",
            },
            type="sheet-processor",
        )


# Export products
async def generate_excel_file(email: str):
    logger.debug("Products export started.......")

    products = await prisma.product.find_many(
        include={
            "categories": True,
            "collections": True,
            "brands": True,
            "images": True,
        }
    )

    if not products:
        raise HTTPException(status_code=404, detail="No products found")

    # Create a workbook and select the active worksheet
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Products"

    # Define the header row
    headers = [
        "id",
        "name",
        "slug",
        "description",
        "price",
        "old_price",
        # "inventory",
        "ratings",
        "image",
        "is_active",
        "categories",
        "collections",
        "brands",
        "images",
    ]
    sheet.append(headers)

    # Fetch product data and append each product as a row
    for product in products:
        # Create a comma-separated string of collection names
        brands_str = ",".join(product.brands)
        categories_str = ",".join(product.categories)
        collections_str = ",".join(product.collections)
        images_str = "|".join(product.images)

        # Append the product data as a row
        sheet.append(
            [
                product.id,
                product.name,
                product.slug,
                product.description,
                product.price,
                product.old_price,
                # product.inventory,
                product.ratings,
                product.image,
                product.is_active,
                categories_str,
                collections_str,
                brands_str,
                images_str,
            ]
        )

    # Create an in-memory Excel file using BytesIO
    output = BytesIO()
    workbook.save(output)
    output.seek(0)

    # Generate a unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"product_export_{timestamp}.xlsx"

    # Upload the in-memory file to Supabase
    client: Client = create_client(
        url=settings.SUPABASE_URL,
        key=settings.SUPABASE_KEY,
    )
    data = client.storage.from_("exports").upload(filename, output, {"contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"})
    download_url = data["publicUrl"]

    # Send email with download link
    email_data = generate_data_export_email(download_link=download_url)
    send_email(
        email_to=email,
        subject="Product Export Ready",
        html_content=email_data.html_content,
    )
    logger.debug("Product export complete")

    return download_url
