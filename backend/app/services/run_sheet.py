import csv
import time
from datetime import datetime
from io import BytesIO

from fastapi import (
    HTTPException,
)
from openpyxl import Workbook, load_workbook

from app.api.routes.websocket import manager
from app.core.logging import logger
from app.core.utils import generate_data_export_email, send_email, slugify

from app.core.config import settings

import asyncio
from prisma import Prisma
from typing import List
from datetime import datetime

from supabase import create_client, Client


async def broadcast_channel(data, user_id: int):
    await manager.broadcast(
        id=str(user_id),
        data=data,
        type="sheet-processor",
    )


# async def process_products(file_content, content_type: str, user_id: int):
#     start_time = time.time()  # Start timing the process
#     try:
#         # Create a BytesIO stream from the file content
#         file_stream = BytesIO(file_content)

#         if content_type in [
#             "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
#             "text/xlsx",
#         ]:
#             # Read Excel file using openpyxl
#             workbook = load_workbook(file_stream)
#             sheet = workbook.active
#             rows = list(sheet.iter_rows(values_only=True))
#             headers = rows[0]
#             data_rows = rows[1:]

#         elif content_type == "text/csv":
#             # Read CSV file using csv module
#             file_stream.seek(0)
#             csv_reader = csv.reader(file_stream.decode("utf-8").splitlines())
#             rows = list(csv_reader)
#             headers = rows[0]
#             data_rows = rows[1:]

#         else:
#             raise ValueError(
#                 "Unsupported file format. Please upload a CSV or Excel file."
#             )

#         # Batch size and iteration setup
#         batch_size = 20
#         num_batches = (len(data_rows) // batch_size) + 1
#         # Track all product slugs from the sheet
#         product_slugs_in_sheet = set()

#         # Send WebSocket update
#         await broadcast_channel(
#             data={
#                 "total_rows": num_batches * batch_size,
#                 "processed_rows": 1,
#                 "status": "processing",
#             },
#             user_id=user_id,
#         )

#         for i in range(num_batches):
#             batch = data_rows[i * batch_size: (i + 1) * batch_size]
#             logger.info(f"Processing batch {i + 1}")

#             # Extract and process the products
#             products_to_create_or_update = []
#             for row in batch:
#                 row_data = dict(zip(headers, row, strict=False))
#                 name = row_data.get("name", "")
#                 active = row_data.get("is_active", True)
#                 is_active = row_data.get("is_active", True)

#                 if isinstance(is_active, str):
#                     is_active = True if active == "TRUE" else False

#                 product_data = {
#                     "id": row_data.get("id", ""),
#                     "name": name,
#                     "slug": row_data.get("slug", name.lower().replace(" ", "-")),
#                     "description": row_data.get("description", ""),
#                     "price": int(row_data.get("price", 0)),
#                     "old_price": int(row_data.get("old_price", 0)),
#                     "inventory": row_data.get("inventory", 1),
#                     "is_active": is_active,
#                     "ratings": row_data.get("ratings", 4.7),
#                     "image": row_data.get("image", ""),
#                 }

#                 brands = row_data.get("brands", "")
#                 categories = row_data.get("categories", "")
#                 collections = row_data.get("collections", "")
#                 images = row_data.get("images", "")
#                 product_slugs_in_sheet.add(product_data["slug"])

#                 # Add product data to be processed later
#                 products_to_create_or_update.append(
#                     (product_data, brands, categories, collections, images)
#                 )

#             # Process the batch
#             await create_or_update_products_in_db(products_to_create_or_update)

#             # Send WebSocket update
#             await broadcast_channel(
#                 data={
#                     "total_rows": num_batches * batch_size,
#                     "processed_rows": (i + 1) * batch_size,
#                     "status": "processing",
#                 },
#                 user_id=user_id,
#             )

#         # After processing, delete products not in the sheet
#         await delete_products_not_in_sheet(
#             product_slugs_in_sheet=product_slugs_in_sheet, user_id=user_id
#         )

#         logger.info("Sheet processed successfully")
#         end_time = time.time()
#         logger.info(
#             f"Total processing time: {end_time - start_time:.2f} seconds"
#         )  # Log total time
#     except Exception as e:
#         logger.error(f"An error occurred while processing. Error{e}")
#         await manager.broadcast(
#             id="sheet",
#             data={
#                 "message": f"An error occurred while processing. Error{e}",
#                 "status": "error",
#             },
#             type="sheet-processor",
#         )


# async def create_or_update_products_in_db(products: list):
#     with Session(engine) as session:
#         try:
#             # Collect all slugs first to minimize database queries
#             all_slugs = [p[0]["slug"] for p in products]
#             existing_products = {
#                 p.slug: p for p in session.exec(
#                     select(Product).where(Product.slug.in_(all_slugs))
#                 ).all()
#             }

#             products_to_add = []
#             for product_data, _brands, _categories, _collections, images in products:
#                 if product_data["slug"] in existing_products:
#                     # Update existing product
#                     existing_product = existing_products[product_data["slug"]]
#                     for key, value in product_data.items():
#                         if key != "id":
#                             setattr(existing_product, key, value)
#                 else:
#                     # Prepare new product for bulk insert
#                     if "id" in product_data:
#                         del product_data["id"]
#                     products_to_add.append(Product(**product_data))

#             # Bulk insert new products
#             if products_to_add:
#                 session.add_all(products_to_add)

#             session.commit()

#             # Update related models in bulk
#             await update_related_models(products, session)

#         except SQLAlchemyError as e:
#             session.rollback()
#             logger.error(f"Error in batch update: {str(e)}")
#             await manager.broadcast(
#                 id="sheet",
#                 data={
#                     "message": f"Error processing product: {str(e)}",
#                     "status": "error",
#                 },
#                 type="sheet-processor",
#             )
#             raise


# async def update_related_models(products: list, session: Session):
#     # Collect all slugs
#     product_slugs = [p[0]["slug"] for p in products]

#     # Fetch all products in one query
#     products_map = {
#         p.slug: p for p in session.exec(
#             select(Product).where(Product.slug.in_(product_slugs))
#         ).all()
#     }

#     # Prepare bulk operations
#     brands_to_add = []
#     categories_to_add = []
#     collections_to_add = []
#     images_to_add = []

#     # Get all existing categories and collections upfront
#     all_brands = {
#         c.slug: c for c in session.exec(select(Brand)).all()
#     }
#     all_categories = {
#         c.slug: c for c in session.exec(select(Category)).all()
#     }
#     all_collections = {
#         c.slug: c for c in session.exec(select(Collection)).all()
#     }

#     for product_data, brands, categories, collections, images in products:
#         product = products_map.get(product_data["slug"])
#         if not product:
#             continue

#         # Delete existing relationships in bulk
#         session.exec(delete(ProductBrand).where(
#             ProductBrand.product_id == product.id))
#         session.exec(delete(ProductCategory).where(
#             ProductCategory.product_id == product.id))
#         session.exec(delete(ProductCollection).where(
#             ProductCollection.product_id == product.id))
#         session.exec(delete(ProductImages).where(
#             ProductImages.product_id == product.id))

#         # Prepare new relationships for bulk insert
#         if brands and isinstance(brands, str):
#             for brand_slug in brands.split(","):
#                 brand_slug = brand_slug.strip()
#                 if brand := all_brands.get(brand_slug):
#                     brands_to_add.append(
#                         ProductBrand(product_id=product.id, brand_id=brand.id)
#                     )

#         if categories and isinstance(categories, str):
#             for cat_slug in categories.split(","):
#                 cat_slug = cat_slug.strip()
#                 if category := all_categories.get(cat_slug):
#                     categories_to_add.append(
#                         ProductCategory(product_id=product.id,
#                                         category_id=category.id)
#                     )

#         if collections and isinstance(collections, str):
#             for coll_slug in collections.split(","):
#                 coll_slug = coll_slug.strip()
#                 if collection := all_collections.get(coll_slug):
#                     collections_to_add.append(
#                         ProductCollection(
#                             product_id=product.id, collection_id=collection.id)
#                     )

#         if images and isinstance(images, str):
#             for image in images.split("|"):
#                 images_to_add.append(
#                     ProductImages(product_id=product.id, image=image.strip())
#                 )

#     # Bulk insert all relationships
#     if brands_to_add:
#         session.add_all(brands_to_add)
#     if categories_to_add:
#         session.add_all(categories_to_add)
#     if collections_to_add:
#         session.add_all(collections_to_add)
#     if images_to_add:
#         session.add_all(images_to_add)

#     session.commit()


# async def delete_products_not_in_sheet(product_slugs_in_sheet: set, user_id: int):
#     try:
#         with Session(engine) as session:
#             # Query the database after all insertions and updates
#             existing_slugs_in_db = set(
#                 session.exec(select(Product.slug)).all())

#             # Remove products from the database that are not in the sheet
#             slugs_to_remove = existing_slugs_in_db - product_slugs_in_sheet
#             if slugs_to_remove:
#                 # First, delete associated records in related tables
#                 products_to_remove = session.exec(
#                     select(Product).where(Product.slug.in_(slugs_to_remove))
#                 ).all()

#                 for product in products_to_remove:
#                     session.exec(
#                         delete(ProductBrand).where(
#                             ProductBrand.product_id == product.id
#                         )
#                     )
#                     session.exec(
#                         delete(ProductCollection).where(
#                             ProductCollection.product_id == product.id
#                         )
#                     )
#                     session.exec(
#                         delete(ProductCategory).where(
#                             ProductCategory.product_id == product.id
#                         )
#                     )
#                     session.exec(
#                         delete(ProductImages).where(
#                             ProductImages.product_id == product.id
#                         )
#                     )

#                 # Now delete the products
#                 session.exec(delete(Product).where(
#                     Product.slug.in_(slugs_to_remove)))
#                 session.commit()
#                 logger.info(
#                     f"Successfully deleted {len(product_slugs_in_sheet)} products."
#                 )
#             else:
#                 logger.info(
#                     "No products to delete. All products are in the sheet.")

#             await broadcast_channel(
#                 data={
#                     "message": "Products successfully synced with the sheet",
#                     "status": "completed",
#                 },
#                 user_id=user_id,
#             )

#     except Exception as e:
#         logger.error(f"An error occurred while deleting products. Error {e}")
#         await manager.broadcast(
#             id="sheet",
#             data={
#                 "message": f"An error occurred while deleting products. Error {e}",
#                 "status": "error",
#             },
#             type="sheet-processor",
#         )


# Export products
async def generate_excel_file(email: str):
    logger.debug("Products export started.......")
    prisma = Prisma()
    await prisma.connect()

    products = await prisma.product.find_many(
        include={
            "categories": True,
            "collections": True,
            "brands": True,
            "images": True,
        }
    )
    # print(products)

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
        "inventory",
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
        brands_str = ",".join([brand.slug for brand in product.brands])
        categories_str = ",".join(
            [category.slug for category in product.categories])
        collections_str = ",".join(
            [collection.slug for collection in product.collections])
        images_str = "|".join([image.image for image in product.images])

        # Append the product data as a row
        sheet.append(
            [
                product.id,
                product.name,
                product.slug,
                product.description,
                product.price,
                product.old_price,
                0,
                product.ratings,
                product.image,
                True,
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
        settings.SUPABASE_URL, settings.SUPABASE_KEY)

    # Convert BytesIO to bytes to match the expected input type
    output_bytes = output.getvalue()
    result = client.storage.from_("exports").upload(filename, output_bytes, {
        "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"})

    # Get public URL
    public_url = client.storage.from_("exports").get_public_url(filename)

    # Send email with download link
    email_data = generate_data_export_email(download_link=public_url)
    send_email(
        email_to=email,
        subject="Product Export Ready",
        html_content=email_data.html_content,
    )
    logger.debug("Product export complete")

    return public_url


async def parse_categories(categories_str: str) -> List[str]:
    """Parse comma-separated categories string into a list."""
    if not categories_str:
        return []
    return [cat.strip() for cat in categories_str.split(",") if cat.strip()]


async def parse_collections(collections_str: str) -> List[str]:
    """Parse comma-separated collections string into a list."""
    if not collections_str:
        return []
    return [col.strip() for col in collections_str.split(",") if col.strip()]


async def parse_images(images_str: str) -> List[str]:
    """Parse pipe-separated images string into a list."""
    if not images_str:
        return []
    return [img.strip() for img in images_str.split("|") if img.strip()]


async def upsert_category(prisma: Prisma, category_name: str) -> int:
    """Upsert a category and return its ID."""
    slug = category_name.lower().replace(" ", "-")
    category = await prisma.category.upsert(
        where={"slug": slug},
        data={
            "create": {
                "name": category_name,
                "slug": slug,
                "is_active": True
            },
            "update": {}
        }
    )
    return category.id


async def upsert_collection(prisma: Prisma, collection_name: str) -> int:
    """Upsert a collection and return its ID."""
    slug = collection_name.lower().replace(" ", "-")
    collection = await prisma.collection.upsert(
        where={"slug": slug},
        data={
            "create": {
                "name": collection_name,
                "slug": slug,
                "is_active": True
            },
            "update": {}
        }
    )
    return collection.id


async def bulk_upload_products(products: list[dict]):
    prisma = Prisma()
    await prisma.connect()

    try:
        # Process each product
        for product_data in products:
            # Handle categories
            category_names = await parse_categories(product_data.get("categories", ""))
            category_ids = []
            for cat_name in category_names:
                cat_id = await upsert_category(prisma, cat_name)
                category_ids.append(cat_id)

            # Handle collections
            collection_names = await parse_collections(product_data.get("collections", ""))
            collection_ids = []
            for coll_name in collection_names:
                coll_id = await upsert_collection(prisma, coll_name)
                collection_ids.append(coll_id)

            # Handle additional images
            image_urls = await parse_images(product_data.get("images", ""))

            # Determine product status based on inventory
            status = "IN_STOCK" if product_data["inventory"] > 0 else "OUT_OF_STOCK"

            # Upsert product
            product = await prisma.product.upsert(
                where={"slug": product_data["slug"]},
                data={
                    "create": {
                        "name": product_data["name"],
                        "slug": product_data["slug"],
                        "sku": product_data["sku"],
                        "description": product_data["description"],
                        "price": float(product_data["price"]),
                        "old_price": float(product_data["old_price"]) if product_data["old_price"] else 0.0,
                        "image": product_data["image"],
                        "status": status,
                        "ratings": float(product_data["ratings"]) if product_data["ratings"] else 0.0,
                        "categories": {"connect": [{"id": cid} for cid in category_ids]},
                        "collections": {"connect": [{"id": cid} for cid in collection_ids]},
                    },
                    "update": {
                        "name": product_data["name"],
                        "description": product_data["description"],
                        "price": float(product_data["price"]),
                        "old_price": float(product_data["old_price"]) if product_data["old_price"] else 0.0,
                        "image": product_data["image"],
                        "status": status,
                        "ratings": float(product_data["ratings"]) if product_data["ratings"] else 0.0,
                        "categories": {"set": [{"id": cid} for cid in category_ids]},
                        "collections": {"set": [{"id": cid} for cid in collection_ids]},
                    }
                }
            )

            # Handle product variants (assuming one variant per product for this data)
            await prisma.productvariant.upsert(
                where={"sku": f"{product_data['slug']}-default"},
                data={
                    "create": {
                        "product": {"connect": {"id": product.id}},
                        "name": f"{product_data['name']} Default",
                        "slug": f"{product_data['slug']}-default",
                        "sku": f"{product_data['slug']}-default",
                        "status": status,
                        "price": float(product_data["price"]),
                        "old_price": float(product_data["old_price"]) if product_data["old_price"] else 0.0,
                        "inventory": product_data["inventory"]
                    },
                    "update": {
                        "price": float(product_data["price"]),
                        "old_price": float(product_data["old_price"]) if product_data["old_price"] else 0.0,
                        "inventory": product_data["inventory"],
                        "status": status
                    }
                }
            )

            # Handle additional images
            if image_urls:
                # Clear existing images
                await prisma.productimage.delete_many(where={"product_id": product.id})
                # Add new images
                await prisma.productimage.create_many(
                    data=[
                        {"product_id": product.id, "image": url}
                        for url in image_urls
                    ]
                )

            print(f"Processed product: {product_data['name']}")

        # await prisma.tx.commit()
        print("Bulk upload completed successfully")

    except Exception as e:
        # await prisma.tx.rollback()
        print(f"Error during bulk upload: {str(e)}")
    finally:
        await prisma.disconnect()


async def process_products(file_content, content_type: str, user_id: int) -> list[dict]:
    """Load product data from a TSV file."""
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
            batch = data_rows[i * batch_size: (i + 1) * batch_size]
            logger.info(f"Processing batch {i + 1}")

            # Extract and process the products
            products = []
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
                    "sku": row_data.get("sku", f"{name.lower().replace(' ', '-')}-default"),
                    "description": row_data.get("description", ""),
                    "price": float(row_data.get("price", 0.0)),
                    "old_price": float(row_data.get("old_price", 0.0)),
                    "inventory": row_data.get("inventory", 1),
                    "is_active": is_active,
                    "ratings": row_data.get("ratings", 4.7),
                    "image": row_data.get("image", ""),
                    "categories": row_data.get("categories", ""),
                    "collections": row_data.get("collections", ""),
                    "brands": row_data.get("brands", ""),
                    "images": row_data.get("images", ""),
                }

                products.append(product_data)

            await bulk_upload_products(products)
            print(f"Bulk upload for batch {i + 1} completed successfully")

            # Send WebSocket update
            await broadcast_channel(
                data={
                    "total_rows": num_batches * batch_size,
                    "processed_rows": (i + 1) * batch_size,
                    "status": "processing",
                },
                user_id=user_id,
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
