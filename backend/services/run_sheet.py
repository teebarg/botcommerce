from datetime import datetime
from io import BytesIO
from typing import Any, List

import pandas as pd
from fastapi import (
    HTTPException,
)
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.sql import delete
from sqlmodel import Session, select

from api.websocket import manager
from core.logging import logger
from core.utils import generate_data_export_email, send_email
from db.engine import engine
from models.generic import Collection, Product, ProductCollection, ProductImages


async def process_products(file_content, content_type: str):
    try:
        # Create a BytesIO stream from the file content
        file_stream = BytesIO(file_content)

        # Read the file into a pandas DataFrame
        if content_type in [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/xlsx",
        ]:
            df = pd.read_excel(file_stream)  # Handle Excel files
        elif content_type == "text/csv":
            df = pd.read_csv(file_stream)  # Handle CSV files
        else:
            raise ValueError(
                "Unsupported file format. Please upload a CSV or Excel file."
            )

        # Batch size and iteration setup
        batch_size = 500
        num_batches = (len(df) // batch_size) + 1

        # Track all product slugs from the sheet
        product_slugs_in_sheet = set(df["slug"].unique())

        for i in range(num_batches):
            batch = df[i * batch_size : (i + 1) * batch_size]
            logger.info(f"Processing batch {i + 1}")

            # Extract and process the products
            products_to_create_or_update = []
            for _index, row in batch.iterrows():
                name = row.get("name", "")
                product_data = {
                    "id": row.get("id", ""),
                    "name": name,
                    "slug": row.get("slug", name.lower().replace(" ", "-")),
                    "description": row.get("description", ""),
                    "price": int(row.get("price", 0)),
                    "old_price": int(row.get("old_price", 0)),
                    "inventory": row.get("inventory", 1),
                    "is_active": row.get("is_active", True),
                    "ratings": row.get("ratings", 4.7),
                    "image": row.get("image", ""),
                }
                collections = row.get(
                    "collections", ""
                )  # Handling multiple collections

                images = row.get("images", "")

                # Add product data to be processed later
                products_to_create_or_update.append((product_data, collections, images))

            # Process the batch
            await create_or_update_products_in_db(products_to_create_or_update)

            # Send WebSocket update
            await manager.broadcast(
                id="sheet",
                data={
                    "total_rows": num_batches,
                    "processed_rows": {i + 1},
                    "status": "processing",
                },
                type="sheet-processor",
            )

        # After processing, delete products not in the sheet
        await delete_products_not_in_sheet(product_slugs_in_sheet)

        logger.info("Sheet processed successfully")
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


async def create_or_update_products_in_db(products: List):
    with Session(engine) as session:
        for product_data, collections, images in products:
            logger.info(f"Processing product {product_data['name']}")
            try:
                # Check if the product exists
                product = session.exec(
                    select(Product).where(Product.id == product_data["id"])
                ).first()

                if product:
                    # Update existing product
                    for key, value in product_data.items():
                        setattr(product, key, value)
                    session.add(product)
                else:
                    del product_data["id"]
                    # Create new product
                    product = Product(**product_data)
                    session.add(product)

                session.commit()
                session.refresh(product)

                await update_collections(product, collections, session)
                await update_images(product, images, session)

            except SQLAlchemyError as e:
                logger.error("Error updating product" + str(e))
                await manager.broadcast(
                    id="sheet",
                    data={
                        "message": f"Error processing product: {str(e)}",
                        "status": "error",
                    },
                    type="sheet-processor",
                )
                session.rollback()


async def update_collections(product, collections, session: Session):
    # Assuming collections are stored in the product_collections table
    session.exec(
        delete(ProductCollection).where(ProductCollection.product_id == product.id)
    )
    session.commit()

    if collections and type(collections) is not str:
        return

    for item in collections.split(","):
        collection = session.exec(
            select(Collection).where(Collection.slug == item)
        ).first()
        session.add(
            ProductCollection(product_id=product.id, collection_id=collection.id)
        )

    session.commit()


async def update_images(product, images, session: Session):
    session.exec(delete(ProductImages).where(ProductImages.product_id == product.id))
    session.commit()

    if images and type(images) is not str:
        return

    for item in images.split("|"):
        session.add(ProductImages(product_id=product.id, image=item))

    session.commit()


async def delete_products_not_in_sheet(product_slugs_in_sheet: set):
    try:
        with Session(engine) as session:
            # Query the database after all insertions and updates
            existing_slugs_in_db = set(session.exec(select(Product.slug)).all())

            # Remove products from the database that are not in the sheet
            slugs_to_remove = existing_slugs_in_db - product_slugs_in_sheet
            if slugs_to_remove:
                session.exec(delete(Product).where(Product.slug.in_(slugs_to_remove)))
                session.commit()
                logger.info(
                    f"Successfully deleted {len(product_slugs_in_sheet)} products."
                )
            else:
                logger.info("No products to delete. All products are in the sheet.")

            await manager.broadcast(
                id="sheet",
                data={
                    "message": "Products successfully synced with the sheet",
                    "status": "completed",
                },
                type="sheet-processor",
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
async def generate_excel_file(bucket: Any, email: str):
    logger.debug("Products export started.......")
    with Session(engine) as session:
        # Fetch products and their collections
        products = session.exec(select(Product)).all()

        if not products:
            raise HTTPException(status_code=404, detail="No products found")

        # Create a list to store product data
        product_data = []
        for product in products:
            # Fetch product collections as a comma-separated string
            collections = session.exec(
                select(Collection.slug)
                .join(
                    ProductCollection, Collection.id == ProductCollection.collection_id
                )
                .where(ProductCollection.product_id == product.id)
            ).all()

            # Fetch product images as a |-separated string
            images = session.exec(
                select(ProductImages.image).where(
                    ProductImages.product_id == product.id
                )
            ).all()

            # Create a comma-separated string of collection names
            collections_str = ",".join(collections)
            images_str = "|".join(images)

            # Append product data to list
            product_data.append(
                {
                    "id": product.id,
                    "name": product.name,
                    "slug": product.slug,
                    "description": product.description,
                    "price": product.price,
                    "old_price": product.old_price,
                    "inventory": product.inventory,
                    "ratings": product.ratings,
                    "image": product.image,
                    "is_active": product.is_active,
                    "collections": collections_str,
                    "images": images_str,
                }
            )

        # Create a DataFrame from the product data
        df = pd.DataFrame(product_data)

        # Use BytesIO to create an in-memory Excel file
        output = BytesIO()
        df.to_excel(output, index=False, engine="openpyxl")

        # Move the stream to the start of the file
        output.seek(0)

        # Generate a unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"product_export_{timestamp}.xlsx"

        # Upload the in-memory file to Firebase
        blob = bucket.blob(f"exports/{filename}")
        blob.upload_from_file(
            output,
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        blob.make_public()  # Makes the file publicly accessible
        download_url = blob.public_url

        # Send email with download link
        email_data = generate_data_export_email(download_link=download_url)
        send_email(
            email_to=email,
            subject="Product Export Ready",
            html_content=email_data.html_content,
        )
        logger.debug("Product export complete")

        return download_url
