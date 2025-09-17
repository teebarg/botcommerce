from app.prisma_client import prisma as db
from app.core.config import settings
from app.core.logging import get_logger
from app.services.meilisearch import add_documents_to_index, update_document, clear_index, delete_document
from app.models.product import Product
from app.services.run_sheet import process_products, generate_excel_file
from app.services.prisma import with_prisma_connection
from app.services.websocket import manager
from app.services.activity import log_activity
from app.services.redis import invalidate_list, bust

logger = get_logger(__name__)


@with_prisma_connection
async def sync_index_image(image_id:str, product: Product = None):
    try:
        if product is not None:
            delete_document(index_name=settings.MEILI_PRODUCTS_INDEX, document_id=str(product.id))
        delete_document(index_name=settings.MEILI_IMAGES_INDEX, document_id=str(image_id))
    except Exception as e:
        logger.debug(f"Error re-indexing image {image_id}: {e}")

    if product is not None:
        await bust(f"product:{product.slug}")
        await manager.broadcast_to_all(
            data={
                "key": f"product:{product.slug}",
            },
            message_type="invalidate",
        )
        await invalidate_list("products")
        await manager.broadcast_to_all(
            data={
                "key": "products",
            },
            message_type="invalidate",
        )
    else:
        await invalidate_list("products:gallery")
        await manager.broadcast_to_all(
            data={
                "key": "products:gallery",
            },
            message_type="invalidate",
        )


@with_prisma_connection
async def sync_index_product(product: Product = None):
    try:
        delete_document(index_name=settings.MEILI_PRODUCTS_INDEX, document_id=str(product.id))
    except Exception as e:
        logger.debug(f"Error re-indexing product {product.id}: {e}")

    for sc in (product.shared_collections or []):
        await invalidate_list(f"product:catalog:{sc.slug}")
        await manager.broadcast_to_all(
            data={
                "key": f"product:catalog:{sc.slug}",
            },
            message_type="invalidate",
        )
    await bust(f"product:{product.slug}")
    await manager.broadcast_to_all(
        data={
            "key": f"product:{product.slug}",
        },
        message_type="invalidate",
    )
    await invalidate_list("products")
    await manager.broadcast_to_all(
        data={
            "key": "products",
        },
        message_type="invalidate",
    )


@with_prisma_connection
async def reindex_catalog(product_id: int):
    try:
        product = await db.product.find_unique(
            where={"id": product_id},
            include={"images": True}
        )

        if not product:
            logger.warning(
                f"Product with id {product_id} not found for re-indexing.")
            return

        try:
            for image in product.images:
                await reindex_image(image_id=image.id)
            logger.info(f"Successfully reindexed product {product_id}")
        except Exception as e:
            logger.debug(f"Error re-indexing product {product_id}: {e}")

        await invalidate_list(f"product:catalog")
        await manager.broadcast_to_all(
            data={
                "key": f"product:catalog",
            },
            message_type="invalidate",
        )
    except Exception as e:
        logger.error(f"Error re-indexing reindex_catalog {product_id}: {e}")


@with_prisma_connection
async def reindex_catalogs(product_ids: list[int]):
    try:
        products = await db.product.find_many(
            where={"id": {"in": product_ids}},
            include={
                "images": True,
            }
        )

        if not products:
            logger.warning(
                f"Products with ids {product_ids} not found for re-indexing.")
            return

        try:
            for product in products:
                for image in product.images:
                    await reindex_image(image_id=image.id)
            logger.info(f"Successfully reindexed products {product_ids}")
        except Exception as e:
            logger.debug(f"Error re-indexing products {product_ids}: {e}")

        await invalidate_list(f"product:catalog")
        await manager.broadcast_to_all(
            data={
                "key": f"product:catalog",
            },
            message_type="invalidate",
        )

    except Exception as e:
        logger.error(f"Error re-indexing products {product_ids}: {e}")


@with_prisma_connection
async def reindex_product(product_id: int):
    try:
        product = await db.product.find_unique(
            where={"id": product_id},
            include={
                # "variants": True,
                # "categories": True,
                "images": True,
                # "collections": True,
                # "reviews": True,
                # "shared_collections": True,
            }
        )

        if not product:
            logger.warning(
                f"Product with id {product_id} not found for re-indexing.")
            return

        # product_data = prepare_product_data_for_indexing(product)

        # try:
        #     await update_document(index_name=settings.MEILI_PRODUCTS_INDEX, document=product_data)
        # except Exception as e:
        #     logger.debug(f"Error re-indexing product {product_id}: {e}")

        try:
            for image in product.images:
                await reindex_image(image_id=image.id)
            logger.info(f"Successfully reindexed product {product_id}")
        except Exception as e:
            logger.debug(f"Error re-indexing product {product_id}: {e}")

        # logger.info(f"Successfully reindexed product {product_id}")

        # await bust(f"product:{product.slug}")
        # await manager.broadcast_to_all(
        #     data={
        #         "key": f"product:{product.slug}",
        #     },
        #     message_type="invalidate",
        # )
        # await invalidate_list("products")
        # await manager.broadcast_to_all(
        #     data={
        #         "key": "products",
        #     },
        #     message_type="invalidate",
        # )

    except Exception as e:
        logger.error(f"Error re-indexing product {product_id}: {e}")


@with_prisma_connection
async def index_products():
    """
    Re-index all products in the database to Meilisearch.
    """
    try:
        logger.info("Starting re-indexing..........")
        products = await db.product.find_many(
            include={
                # "variants": True,
                # "categories": True,
                # "collections": True,
                "images": True,
                # "reviews": True,
                # "shared_collections": True,
            }
        )

        try:
            for product in products:
                for image in product.images:
                    await reindex_image(image_id=image.id)
            logger.info(f"Successfully reindexed products images")
        except Exception as e:
            logger.debug(f"Error re-indexing products images: {e}")

        # documents = []
        # for product in products:
        #     product_dict = prepare_product_data_for_indexing(product)
        #     documents.append(product_dict)

        # clear_index(settings.MEILI_PRODUCTS_INDEX)
        # add_documents_to_index(
        #     index_name=settings.MEILI_PRODUCTS_INDEX, documents=documents)

        # logger.info(f"Reindexed {len(documents)} products successfully.")
        # await invalidate_list("products")
        # await invalidate_list("product")
        # await manager.broadcast_to_all(
        #     data={
        #         "key": "products",
        #     },
        #     message_type="invalidate",
        # )
        # await manager.broadcast_to_all(
        #     data={
        #         "key": "product",
        #     },
        #     message_type="invalidate",
        # )
    except Exception as e:
        logger.error(f"Error during product re-indexing: {e}")


@with_prisma_connection
async def product_upload(user_id: str):
    logger.info("Starting product upload processing...")
    try:
        num_rows = await process_products(user_id=user_id)

        await index_products()
        logger.info("Re-indexing completed.")
        await manager.send_to_user(
            user_id=user_id,
            data={
                "status": "completed",
                "total_rows": num_rows,
                "processed_rows": num_rows,
            },
            message_type="sheet-processor",
        )

        await log_activity(
            user_id=user_id,
            activity_type="PRODUCT_UPLOAD",
            description=f"Uploaded products from google sheet",
            is_success=True
        )
    except Exception as e:
        logger.error(f"Error processing data from file: {e}")
        await log_activity(
            user_id=user_id,
            activity_type="PRODUCT_UPLOAD",
            description=f"Failed to upload products from google sheet",
            is_success=False
        )


@with_prisma_connection
async def product_export(email: str, user_id: str):
    download_url = await generate_excel_file(email=email)

    await log_activity(
        user_id=user_id,
        activity_type="PRODUCT_EXPORT",
        description="Exported products to Excel",
        action_download_url=download_url
    )


@with_prisma_connection
async def index_images(invalidate_products: bool = False, product_only: bool = False):
    """
    Re-index all products in the database to Meilisearch.
    """
    try:
        logger.info("Starting re-indexing..........")
        where_clause = {"order": 0}
        if product_only:
            where_clause["product"] = {"is_not": None}
        images = await db.productimage.find_many(
            where=where_clause,
            order={"id": "desc"},
            include={
                "product": {
                    "include": {
                        "categories": True,
                        "collections": True,
                        "variants": True,
                        "shared_collections": True,
                        "images": True,
                    }
                }
            },
        )

        documents = []
        for image in images:
            image_dict = prepare_image_data_for_indexing(image)
            documents.append(image_dict)

        clear_index(settings.MEILI_IMAGES_INDEX)
        add_documents_to_index(
            index_name=settings.MEILI_IMAGES_INDEX, documents=documents)

        logger.info(f"Reindexed {len(documents)} images successfully.")

        if invalidate_products:
            documents = []
            for image in images:
                if image.product:
                    product_dict = prepare_product_data_for_indexing(image.product)
                    documents.append(product_dict)

            clear_index(settings.MEILI_PRODUCTS_INDEX)
            add_documents_to_index(
                index_name=settings.MEILI_PRODUCTS_INDEX, documents=documents)

            logger.info(f"Reindexed {len(documents)} products successfully.")

        if invalidate_products:
            await invalidate_list("products")
            await manager.broadcast_to_all(
                    data={
                        "key": "products",
                    },
                message_type="invalidate",
            )
            await invalidate_list("product")
            await manager.broadcast_to_all(
                data={
                    "key": "product",
                },
                message_type="invalidate",
            )
        else:
            await invalidate_list("products:gallery")
            await manager.broadcast_to_all(
                    data={
                        "key": "products:gallery",
                    },
                message_type="invalidate",
            )
    except Exception as e:
        logger.error(f"Error during product re-indexing: {e}")


@with_prisma_connection
async def reindex_image(image_id: int):
    try:
        image = await db.productimage.find_unique(
            where={"id": image_id},
            include={
                "product": {
                    "include": {
                        "categories": True,
                        "collections": True,
                        "variants": True,
                        "images": True,
                        "shared_collections": True,
                    }
                }
            },
        )

        if not image:
            logger.warning(
                f"Product image with id {image_id} not found for re-indexing.")
            return

        try:
            image_data = prepare_image_data_for_indexing(image)
            await update_document(index_name=settings.MEILI_IMAGES_INDEX, document=image_data)
            if image.product:
                product_data = prepare_product_data_for_indexing(image.product)
                await update_document(index_name=settings.MEILI_PRODUCTS_INDEX, document=product_data)
        except Exception as e:
            logger.debug(f"Error re-indexing product image {image_id}: {e}")

        logger.info(f"Successfully reindexed product image {image_id}")

        if image.product:
            await bust(f"product:{image.product.slug}")
            await manager.broadcast_to_all(
                    data={
                        "key": f"product:{image.product.slug}",
                    },
                message_type="invalidate",
            )
            await invalidate_list("products")
            await manager.broadcast_to_all(
                    data={
                        "key": "products",
                    },
                    message_type="invalidate",
                )
        else:
            await invalidate_list("products:gallery")
            await manager.broadcast_to_all(
                    data={
                        "key": "products:gallery",
                    },
                    message_type="invalidate",
                )

    except Exception as e:
        logger.error(f"Error re-indexing product {product_id}: {e}")


def prepare_product_data_for_indexing(product: Product) -> dict:
    # product_dict = product.dict()
    product_dict = {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "description": product.description,
        "sku": product.sku,
        "active": product.active,
    }

    product_dict["collection_slugs"] = [
        c.slug for c in (product.collections or [])]
    # product_dict["collections"] = [dict(c)
    #                                for c in (product.collections or [])]
    product_dict["collections"] = [{"id": c.id, "slug": c.slug, "name": c.name}
                                   for c in (product.collections or [])]
    product_dict["category_slugs"] = [
        c.slug for c in (product.categories or [])]
    # product_dict["categories"] = [dict(c) for c in (product.categories or [])]
    product_dict["categories"] = [{"id": c.id, "slug": c.slug, "name": c.name}
                                    for c in (product.categories or [])]
    product_dict["images"] = [dict(i) for i in (product.images or [])]
    product_dict["sorted_images"] = [img.image for img in sorted(
        (product.images or []), key=lambda img: img.order)]
    product_dict["image"] = product_dict["sorted_images"][0] if product_dict["sorted_images"] else None

    variants = [v.dict() for v in (product.variants or [])]
    product_dict["variants"] = variants

    variant_prices = [v["price"]
                      for v in variants if v.get("price") is not None]
    product_dict["variant_prices"] = variant_prices
    product_dict["min_variant_price"] = min(
        variant_prices) if variant_prices else 0
    product_dict["max_variant_price"] = max(
        variant_prices) if variant_prices else 0

    reviews = [r.dict() for r in (product.reviews or [])]
    product_dict["reviews"] = reviews

    ratings = [r["rating"] for r in reviews if r.get("rating") is not None]
    product_dict["review_count"] = len(ratings)
    product_dict["average_rating"] = round(
        sum(ratings) / len(ratings), 2) if ratings else 0

    if any(v["inventory"] > 0 for v in variants):
        product_dict["status"] = "IN STOCK"
    else:
        product_dict["status"] = "OUT OF STOCK"
    product_dict["sizes"] = [v["size"]
                             for v in variants if v.get("size") is not None]
    product_dict["colors"] = [v["color"]
                              for v in variants if v.get("color") is not None]

    # product_dict["catalogs"] = [dict(sc)
    #                             for sc in (product.shared_collections or [])]
    product_dict["catalogs_slugs"] = [
        sc.slug for sc in (product.shared_collections or [])]

    return product_dict


def prepare_image_data_for_indexing(image) -> dict:
    product = image.product
    image_dict = {
        "id": image.id,
        "product_id": image.product_id,
        "image": image.image,
        "created_at": image.created_at,
    }

    if product:
        image_dict["name"] = product.name
        image_dict["description"] = product.description
        image_dict["slug"] = product.slug
        image_dict["collections"] = [{"id": c.id, "name": c.name} for c in (product.collections or [])]
        image_dict["categories"] = [{"id": c.id, "name": c.name} for c in (product.categories or [])]
        sorted_images = [img.image for img in sorted(
            (product.images or []), key=lambda img: img.order)]
        image_dict["image"] = sorted_images[0] if sorted_images else None

        variants = [{"id": v.id, "price": v.price, "old_price": v.old_price, "inventory": v.inventory, "size": v.size, "color": v.color, "measurement": v.measurement, "status": v.status} for v in (product.variants or [])]
        image_dict["variants"] = variants

        # variant_prices = [v["price"]
        #                   for v in variants if v.get("price") is not None]
        # image_dict["variant_prices"] = variant_prices

        if any(v["inventory"] > 0 for v in variants):
            image_dict["status"] = "IN_STOCK"
        else:
            image_dict["status"] = "OUT_OF_STOCK"
        image_dict["active"] = product.active
        image_dict["catalogs"] = [sc.slug for sc in (product.shared_collections or [])]

    return image_dict


def to_product_card_view(product: Product) -> dict:
    prepared = prepare_product_data_for_indexing(product)
    return prepared
