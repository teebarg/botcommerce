from typing import List
from models.generic import Collection, Product, ProductCollection
import pandas as pd
from sqlmodel import Session, select
from sqlalchemy.exc import SQLAlchemyError
from db.engine import engine
from sqlalchemy.sql import delete
from io import BytesIO
from api.websocket import manager
from core.logging import logger
import asyncio
import os
from datetime import datetime
from io import BytesIO, StringIO
from typing import Any, Dict
import pandas as pd

from fastapi import (
    HTTPException,
)

from api.websocket import manager
from core.deps import (
    SessionDep,
)
from core.logging import logger
from core.utils import generate_data_export_email, send_email
from models.generic import UploadStatus

async def process_products(file_content, content_type: str):
    try:
        # Create a BytesIO stream from the file content
        file_stream = BytesIO(file_content)

        # Read the file into a pandas DataFrame
        if content_type in ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/xlsx"]:
            df = pd.read_excel(file_stream)  # Handle Excel files
        elif content_type == "text/csv":
            df = pd.read_csv(file_stream)  # Handle CSV files
        else:
            raise ValueError("Unsupported file format. Please upload a CSV or Excel file.")

        # Batch size and iteration setup
        batch_size = 500
        num_batches = (len(df) // batch_size) + 1

        for i in range(num_batches):
            batch = df[i * batch_size : (i + 1) * batch_size]
            logger.info(f"Processing batch {i + 1}")

            # Extract and process the products
            products_to_create_or_update = []
            for index, row in batch.iterrows():
                name = row.get("name", "")
                product_data = {
                    "id": row["id"],
                    "name": name,
                    "slug": row.get("slug", name.lower().replace(" ", "-")),
                    "description": row.get("description", ""),
                    "price": row.get("price", 0),
                    "old_price": row.get("old_price", 0),
                    "inventory": row.get("inventory", 1),
                    "is_active": row.get("is_active", True),
                    "ratings": row.get("ratings", 4.7),
                    "image": row.get("image", ""),
                }
                collections = row.get("collections", "")  # Handling multiple collections

                # Add product data to be processed later
                products_to_create_or_update.append((product_data, collections))

            # Process the batch
            await create_or_update_products_in_db(products_to_create_or_update)

            # Send WebSocket update
            await manager.broadcast(
                id="sheet",
                data={"total_rows": num_batches,  "processed_rows": {i + 1}, "status": "processing"},
                type="sheet-processor",
            )
            logger.info(f"Sheet processed successfully")
    except Exception as e:
        logger.error(f"An error occurred while processing. Error{e}")
        await manager.broadcast(
            id="sheet",
            data={"message": f"An error occurred while processing. Error{e}",  "status": "error"},
            type="sheet-processor",
        )

async def create_or_update_products_in_db(products: List):
    with Session(engine) as session:
        for product_data, collections in products:
            logger.info(f"Processing product {product_data['name']}")
            try:
                # Check if the product exists
                product = session.exec(select(Product).where(Product.id == product_data["id"])).first()

                if product:
                    # Update existing product
                    for key, value in product_data.items():
                        setattr(product, key, value)
                    session.add(product)
                else:
                    # Create new product
                    new_product = Product(**product_data)
                    session.add(new_product)

                session.commit()

                if type(collections) is not str:
                    continue

                # Handle collections
                if collections:
                    await update_collections(product, collections, session)

            except SQLAlchemyError as e:
                logger.error("Error updating product" + str(e))
                await manager.broadcast(
                    id="sheet",
                    data={"message": f"Error processing product {product_data['name']}: {str(e)}",  "status": "error"},
                    type="sheet-processor",
                )
                session.rollback()

async def update_collections(product, collections, session: Session):
    # Assuming collections are stored in the product_collections table
    session.exec(
        delete(ProductCollection).where(ProductCollection.product_id == product.id)
    )
    session.commit()

    for item in collections.split(","):
        collection = session.exec(select(Collection).where(Collection.slug == item)).first()
        session.add(ProductCollection(product_id=product.id, collection_id=collection.id))

    session.commit()


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
                select(Collection.slug).join(ProductCollection, Collection.id == ProductCollection.collection_id).where(
                    ProductCollection.product_id == product.id
                )
            ).all()

            # Create a comma-separated string of collection names
            collections_str = ",".join(collections)

            # Append product data to list
            product_data.append({
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
                "collections": collections_str
            })

         # Create a DataFrame from the product data
        df = pd.DataFrame(product_data)

        # Use BytesIO to create an in-memory Excel file
        output = BytesIO()
        df.to_excel(output, index=False, engine='openpyxl')

        # Move the stream to the start of the file
        output.seek(0)

        # Generate a unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"product_export_{timestamp}.xlsx"

        # Upload the in-memory file to Firebase
        blob = bucket.blob(f"exports/{filename}")
        blob.upload_from_file(output, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        blob.make_public()  # Makes the file publicly accessible
        download_url = blob.public_url

        # Send email with download link
        email_data = generate_data_export_email(download_link=download_url)
        send_email(
            email_to=email,
            subject=f"Product Export Ready",
            html_content=email_data.html_content,
        )
        logger.debug("Product export complete")

        return download_url
