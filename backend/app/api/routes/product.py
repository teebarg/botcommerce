import asyncio
from typing import Any
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    BackgroundTasks,
    Request
)
from app.core.deps import CurrentUser, UserDep
from app.core.logging import get_logger
from app.core.utils import url_to_list
from app.models.generic import Message, ImageUpload
from app.models.product import (
    ProductLite,
    VariantWithStatus,
    SearchProducts, FeedProducts,
    IndexProducts, ReviewStatus
)
from app.services.meilisearch import (
    clear_index,
    delete_index,
    get_or_create_index,
    ensure_index_ready,
    REQUIRED_FILTERABLES,
    REQUIRED_SORTABLES
)
from app.prisma_client import prisma as db
from app.core.storage import upload
from app.core.config import settings
from app.services.product import index_product, index_products
from app.services.redis import cache_response
from meilisearch.errors import MeilisearchApiError
from app.services.generic import remove_image_from_storage
from app.redis_client import redis_client
from collections import Counter
from prisma.enums import PaymentStatus
from app.core.permissions import require_admin

logger = get_logger(__name__)

DEFAULT_MAX_PRICE = 50000
DEFAULT_MIN_PRICE = 1


def build_variant_data(payload) -> dict[str, Any]:
    data = {}
    if payload.size is not None:
        data["size"] = payload.size
    if payload.color is not None:
        data["color"] = payload.color
    if payload.width is not None:
        data["width"] = payload.width
    if payload.length is not None:
        data["length"] = payload.length
    if payload.age is not None:
        data["age"] = payload.age
    if payload.inventory is not None:
        data["inventory"] = payload.inventory
        data["status"] = "IN_STOCK" if payload.inventory > 0 else "OUT_OF_STOCK"
    if payload.price is not None:
        data["price"] = payload.price
    if payload.old_price is not None:
        data["old_price"] = payload.old_price
    return data


def build_relation_data(category_ids=None, collection_ids=None) -> dict[str, Any]:
    data: dict[str, Any] = {}
    if category_ids:
        data["categories"] = {"connect": [{"id": id} for id in category_ids]}
    if collection_ids:
        data["collections"] = {"connect": [{"id": id} for id in collection_ids]}
    return data

router = APIRouter()

@router.get("/{product_id}/review-status")
@cache_response("review-status")
async def get_review_status(
    request: Request,
    product_id: int,
    user: UserDep,
) -> ReviewStatus:
    """
    Check if a user has purchased and reviewed a product.
    """
    if not user:
        return ReviewStatus(has_purchased=False, has_reviewed=False)

    user_id: int = user.id
    purchase_count_task = db.order.count(
        where={
            "user_id": user_id,
            "payment_status": PaymentStatus.SUCCESS,
            "order_items": {
                "some": {
                    "variant": {
                        "product_id": product_id,
                    }
                }
            },
        }
    )

    review_count_task = db.review.count(
        where={
            "user_id": user_id,
            "product_id": product_id,
        }
    )

    purchase_count, review_count = await asyncio.gather(
        purchase_count_task,
        review_count_task,
    )

    return ReviewStatus(
        has_purchased=purchase_count > 0,
        has_reviewed=review_count > 0,
    )

@router.get("/{id}/similar")
@cache_response(key_prefix="product:similar", key=lambda request, id, limit: f"{id}:{limit}", tags=["products", "product:{id}"])
async def recommend(request: Request, id: int, limit: int = Query(default=20, le=100)):
    key: str = f"product:{id}:similar"
    ids = await redis_client.lrange(key, 0, -1)

    if not ids:
        return {"similar": []}

    index = get_or_create_index(settings.MEILI_PRODUCTS_INDEX)

    results = index.get_documents({
        "filter": f"id IN [{','.join(ids)}]",
        "limit": limit
    })

    return {"similar": results.results}


@router.get("/recommend")
@cache_response("products:recommendation", tags=["products"])
async def get_recommendations(request: Request, user: CurrentUser, limit: int = Query(default=20, le=100)):
    redis = request.app.state.redis
    index = get_or_create_index(settings.MEILI_PRODUCTS_INDEX)

    product_ids = await redis.lrange(f"user:{user.id}:history", 0, 4)  # last 5 viewed
    if not product_ids:
        return {"recommended": []}

    recommendation_scores = Counter()
    seen = set(product_ids)

    for pid in product_ids:
        key: str = f"product:{pid}:similar"
        similar_ids = await redis.lrange(key, 0, -1)
        for sid in similar_ids:
            if sid not in seen:
                recommendation_scores[sid] += 1

    if not recommendation_scores:
        return {"recommended": []}

    top_ids = [pid for pid, _ in recommendation_scores.most_common(10)]
    if not top_ids:
        return {"recommended": []}

    filter_str: str = " OR ".join([f"id = {pid}" for pid in top_ids])
    results = index.search("", {"filter": filter_str, "limit": limit})

    return {"recommended": results["hits"]}


# @router.get("/popular")
# async def get_popular_products(
#     limit: int = Query(default=10, le=20)
# ) -> list[ProductSearch]:
#     """Get popular products."""
#     service = PopularProductsService()
#     products = await service.get_popular_products(limit)
#     return products


def has_active_filters(
    search: str,
    cat_ids: str,
    collections: str,
    max_price: int,
    min_price: int,
    sizes: str,
    colors: str,
    ages: str,
    width: str,
    length: str,
) -> bool:
    return any([
        search,
        cat_ids,
        collections,
        sizes,
        colors,
        ages,
        width,
        length,
        min_price != DEFAULT_MIN_PRICE,
        max_price != DEFAULT_MAX_PRICE,
    ])

@router.get("/feed")
@cache_response("products:list", tags=["products"])
async def feed(
    request: Request,
    search: str = "",
    sort: str = "id:desc",
    cat_ids: str = Query(default=""),
    collections: str = Query(default=""),
    max_price: int = Query(default=DEFAULT_MAX_PRICE, gt=0),
    min_price: int = Query(default=DEFAULT_MIN_PRICE, gt=0),
    sizes: str = Query(default=""),
    colors: str = Query(default=""),
    ages: str = Query(default=""),
    width: str = Query(default=""),
    length: str = Query(default=""),
    limit: int = Query(default=20, le=100),
    active: bool = Query(default=True),
    show_suggestions: bool = Query(default=False),
    show_facets: bool = Query(default=False),
    feed_seed: float | None = Query(default=None),
    cursor: str | None = Query(default=None),
) -> FeedProducts:
    """
    Cursor-based discovery feed using Meilisearch-compatible pagination.
    """
    import random, json, base64

    def encode_cursor(hit: dict) -> str:
        payload = {
            "r": hit["random_score"],
            "f": hit["freshness_score"],
            "id": hit["id"],
        }
        return base64.urlsafe_b64encode(
            json.dumps(payload).encode()
        ).decode()

    def decode_cursor(cursor: str) -> dict:
        return json.loads(
            base64.urlsafe_b64decode(cursor.encode()).decode()
        )

    base_filters = []

    if cat_ids:
        base_filters.append(f"category_slugs IN {url_to_list(cat_ids)}")

    if collections:
        base_filters.append(f"collection_slugs IN [{collections}]")

    if min_price and max_price:
        base_filters.append(
            f"min_variant_price >= {min_price} AND max_variant_price <= {max_price}"
        )

    base_filters.append(f"active = {active}")

    if sizes:
        base_filters.append(f"sizes IN [{sizes}]")

    if colors:
        base_filters.append(f"colors IN [{colors}]")

    if ages:
        age_values: str = ", ".join([f'"{age}"' for age in [ages]])
        base_filters.append(f"ages IN [{age_values}]")

    if width:
        base_filters.append(f"widths IN [{width}]")

    if length:
        base_filters.append(f"lengths IN [{length}]")

    if feed_seed is None:
        feed_seed = random.random()

    index = get_or_create_index(settings.MEILI_PRODUCTS_INDEX)
    disable_random_feed: bool = has_active_filters(search, cat_ids, collections, max_price, min_price, sizes, colors, ages, width, length)

    try:
        hits: list[dict] = []
        total_count = 0

        if not disable_random_feed:
            cursor_filter = ""

            if cursor:
                c = decode_cursor(cursor)
                cursor_filter = (
                    f"(random_score > {c['r']} OR "
                    f"(random_score = {c['r']} AND freshness_score < {c['f']}) OR "
                    f"(random_score = {c['r']} AND freshness_score = {c['f']} AND id > {c['id']}))"
                )

            seed_filter: str = f"random_score >= {feed_seed}"

            filters = " AND ".join(
                f for f in [
                    seed_filter,
                    cursor_filter,
                    *base_filters,
                ] if f
            )

            res = index.search(
                "",
                {
                    "limit": limit,
                    "sort": [
                        "random_score:asc",
                        "freshness_score:desc",
                        "id:desc",
                    ],
                    "filter": filters,
                },
            )

            hits = res["hits"]
            total_count = res["estimatedTotalHits"]

            if len(hits) < limit and not cursor:
                remaining = limit - len(hits)

                wrap_filters = " AND ".join(
                    f for f in [
                        f"random_score < {feed_seed}",
                        *base_filters,
                    ] if f
                )

                wrap_res = index.search(
                    "",
                    {
                        "limit": remaining,
                        "sort": [
                            "random_score:asc",
                            "freshness_score:desc",
                            "id:desc",
                        ],
                        "filter": wrap_filters,
                    },
                )

                hits.extend(wrap_res["hits"])
                total_count += wrap_res["estimatedTotalHits"]
        else:
            logger.debug("in normal search")
            search_params = {
                "limit": limit,
                "sort": [sort],
            }

            if base_filters:
                search_params["filter"] = " AND ".join(base_filters)

            if show_facets:
                search_params["facets"] = [
                    "category_slugs",
                    "sizes",
                    "colors",
                    "ages",
                    "widths",
                    "lengths",
                ]

            res = index.search(search, search_params)
            hits = res["hits"]
            total_count = res["estimatedTotalHits"]

        suggestions = []
        if show_suggestions and search:
            suggestions_raw = index.search(
                search,
                {
                    "limit": 4,
                    "attributesToRetrieve": ["name"],
                    "matchingStrategy": "all",
                },
            )
            suggestions = list(
                {hit["name"] for hit in suggestions_raw["hits"] if "name" in hit}
            )

    except MeilisearchApiError as e:
        logger.error(f"Meilisearch error: {e}")
        raise HTTPException(
            status_code=502,
            detail="Search service temporarily unavailable",
        )

    next_cursor: str | None = (
        encode_cursor(hits[-1])
        if hits and total_count > limit
        else None
    )

    return {
        "products": hits,
        "facets": res.get("facetDistribution", {}),
        "limit": limit,
        "total_count": total_count,
        "feed_seed": feed_seed,
        "next_cursor": next_cursor,
        "suggestions": suggestions,
    }


@router.get("/index-products")
@cache_response("products:collection", tags=["products"])
async def get_index_products(request: Request) -> IndexProducts:
    """
    Retrieve index products using Meilisearch.
    """
    result = {"new-arrivals": [], "featured": [], "trending": []}
    collections: list[str] = ["trending", "new-arrivals", "featured" ]
    index = get_or_create_index(settings.MEILI_PRODUCTS_INDEX)
    for col in collections:
        filters: list[str] = ["active = True", f'collection_slugs = "{col}"']
        search_params = {
            "limit": 6 if col == "trending" else 8,
            "sort": ["id:desc"],
        }

        search_params["filter"] = " AND ".join(filters)
        try:
            search_results = index.search("", search_params)
        except MeilisearchApiError as e:
            error_code = getattr(e, "code", None)
            if error_code in {"invalid_search_facets", "invalid_search_filter", "invalid_search_sort"}:
                logger.warning("Invalid filter detected, attempting recovery")
                ensure_index_ready(index)
                try:
                    search_results = index.search("", search_params)
                except Exception:
                    logger.error(f"Meilisearch retry failed: {e}")
                    raise HTTPException(status_code=502, detail="Search service unavailable")
            logger.error(f"Meilisearch error: {e}")
            raise HTTPException(
                status_code=502, detail="Search service temporarily unavailable")
        except Exception as e:
            logger.error(f"search index error {e}")
            raise HTTPException(
                status_code=400,
                detail=str(e)
            )

        result["arrival" if col == "new-arrivals" else col] = search_results["hits"]

    return result

@router.get("/")
@cache_response("products:search", tags=["products"])
async def search(
    request: Request,
    search: str = "",
    sort: str = "id:desc",
    cat_ids: str = Query(default=""),
    collections: str = Query(default=""),
    max_price: int = Query(default=DEFAULT_MAX_PRICE, gt=0),
    min_price: int = Query(default=DEFAULT_MIN_PRICE, gt=0),
    sizes: str = Query(default=""),
    colors: str = Query(default=""),
    ages: str = Query(default=""),
    width: str = Query(default=""),
    length: str = Query(default=""),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, le=100),
    active: bool = Query(default=True),
    show_suggestions: bool = Query(default=False),
    show_facets: bool = Query(default=False),
) -> SearchProducts:
    """
    Retrieve products using Meilisearch, sorted by latest.
    """
    filters = []
    if cat_ids:
        filters.append(f"category_slugs IN {url_to_list(cat_ids)}")
    if collections:
        filters.append(f"collection_slugs IN [{collections}]")
    if min_price and max_price:
        filters.append(
            f"min_variant_price >= {min_price} AND max_variant_price <= {max_price}")
    filters.append(f"active = {active}")
    if sizes:
        filters.append(f"sizes IN [{sizes}]")
    if colors:
        filters.append(f"colors IN [{colors}]")
    if ages:
        age_values: str = ", ".join([f'"{age}"' for age in [ages]])
        filters.append(f"ages IN [{age_values}]")
    if width:
        filters.append(f"widths IN [{width}]")
    if length:
        filters.append(f"lengths IN [{length}]")

    search_params = {
        "limit": limit,
        "offset": skip,
        "sort": [sort or "id:desc"],
    }

    if show_facets:
        search_params["facets"] = ["category_slugs", "sizes", "colors", "ages", "widths", "lengths"]

    if filters:
        search_params["filter"] = " AND ".join(filters)

    index = get_or_create_index(settings.MEILI_PRODUCTS_INDEX)
    try:
        search_results = index.search(
            search,
            {
                **search_params
            }
        )
        suggestions = []
        if show_suggestions:
            suggestions_raw = index.search(
                search,
                {
                    "limit": 4,
                    "attributesToRetrieve": ["name"],
                    "matchingStrategy": "all"
                }
            )
            suggestions = list(
                {hit["name"] for hit in suggestions_raw["hits"] if "name" in hit})

    except MeilisearchApiError as e:
        error_code = getattr(e, "code", None)
        if error_code in {"invalid_search_facets", "invalid_search_filter", "invalid_search_sort"}:
            logger.warning(
                f"Invalid filter detected, attempting to auto-configure filterable attributes: {e}")

            ensure_index_ready(index)

            search_results = index.search(
                search,
                {
                    **search_params
                }
            )
            suggestions = []
            if show_suggestions:
                suggestions_raw = index.search(
                    search,
                    {
                        "limit": 4,
                        "attributesToRetrieve": ["name"],
                        "matchingStrategy": "all"
                    }
                )
                suggestions = list(
                    {hit["name"] for hit in suggestions_raw["hits"] if "name" in hit})

        logger.error(f"Meilisearch error: {e}")
        raise HTTPException(
            status_code=502, detail="Search service temporarily unavailable")
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    total_count = search_results["estimatedTotalHits"]
    total_pages = (total_count // limit) + (total_count % limit > 0)

    hits = search_results["hits"]

    return {
        "products": hits,
        "facets": search_results.get("facetDistribution", {}),
        "skip": skip,
        "limit": limit,
        "total_count": total_count,
        "total_pages": total_pages,
        "suggestions": suggestions,
    }


@router.get("/{slug}")
@cache_response("product:slug", key=lambda request, slug, **kwargs: slug, tags=["products"])
async def read(request: Request, slug: str) -> ProductLite:
    """Get a specific product by slug with Redis caching."""
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


@router.put("/variants/{variant_id}", dependencies=[Depends(require_admin)])
async def update_variant(variant_id: int, variant: VariantWithStatus, background_tasks: BackgroundTasks):
    existing_variant = await db.productvariant.find_unique(where={"id": variant_id})
    if not existing_variant:
        raise HTTPException(status_code=404, detail="Variant not found")

    update_data = {}

    if variant.price:
        update_data["price"] = variant.price

    if variant.old_price:
        update_data["old_price"] = variant.old_price

    if variant.inventory is not None:
        update_data["inventory"] = variant.inventory
        update_data["status"] = variant.inventory > 0 and "IN_STOCK" or "OUT_OF_STOCK"

    if variant.size is not None:
        update_data["size"] = variant.size

    if variant.color is not None:
        update_data["color"] = variant.color

    if variant.width is not None:
        update_data["width"] = variant.width

    if variant.length is not None:
        update_data["length"] = variant.length

    if variant.age is not None:
        update_data["age"] = variant.age

    try:
        updated_variant = await db.productvariant.update(
            where={"id": variant_id},
            data=update_data,
        )
        background_tasks.add_task(
            index_product, product_id=existing_variant.product_id)
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e))

    return updated_variant

@router.post("/{id}/images", dependencies=[Depends(require_admin)])
async def upload_images(id: int, image_data: ImageUpload, background_tasks: BackgroundTasks):
    """
    Upload images to a product.
    """
    product = await db.product.find_unique(where={"id": id}, include={"images": True})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        image_url: str = upload(bucket="product-images", data=image_data)

        image = await db.productimage.create(
            data={
                "image": image_url,
                "product_id": product.id,
                "order": len(product.images)
            }
        )
        background_tasks.add_task(index_product, product_id=id)

        return image
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{id}/images/{image_id}", dependencies=[Depends(require_admin)])
async def delete_product_image(id: int, image_id: int, background_tasks: BackgroundTasks):
    """
    Delete an image from a product images.
    """
    product = await db.product.find_unique(where={"id": id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    image = await db.productimage.find_unique(where={"id": image_id})
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")

    async with db.tx() as tx:
        try:
            await remove_image_from_storage(image.image)
            await tx.productimage.delete(where={"id": image_id})
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=400, detail=str(e))

        images = await tx.productimage.find_many(where={"product_id": id}, order={"order": "asc"})
        for index, image in enumerate(images):
            await tx.productimage.update(
                where={"id": image.id},
                data={"order": index}
            )
        background_tasks.add_task(index_product, product_id=id)

        return {"success": True}


@router.post("/configure-filterable-attributes")
async def configure_filterable_attributes(
    attributes: list[str],
) -> Message:
    """
    Configure filterable attributes for the products index in Meilisearch.
    """
    try:
        index = get_or_create_index(settings.MEILI_PRODUCTS_INDEX)
        index.update_filterable_attributes(REQUIRED_FILTERABLES)
        index.update_sortable_attributes(REQUIRED_SORTABLES)
        # index.update_non_separator_tokens(["-"])

        logger.debug(f"Updated filterable attributes: {attributes}")
        return Message(
            message=f"Filterable attributes updated successfully: {attributes}"
        )
    except Exception as e:
        logger.error(f"Error updating filterable attributes: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while updating filterable attributes.",
        ) from e


@router.get("/search/clear-index", dependencies=[Depends(require_admin)], response_model=dict)
async def config_clear_index():
    """
    Clear the products index in Meilisearch.
    """
    try:
        await clear_index(settings.MEILI_PRODUCTS_INDEX)
        return {"message": "Index cleared"}
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=500, detail=str(e)
        ) from e


@router.post("/search/delete-index", dependencies=[Depends(require_admin)])
async def config_delete_index(index_name: str) -> dict:
    """
    Drop the products index in Meilisearch.
    """
    try:
        delete_index(index_name)
        return {"message": "Index dropped"}
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=500, detail=str(e)
        ) from e


@router.patch("/{id}/images/reorder", dependencies=[Depends(require_admin)])
async def reorder_images(id: int, image_ids: list[int]) -> Message:
    """
    Reorder product images.
    """
    product = await db.product.find_unique(where={"id": id})
    if not product:
        raise HTTPException(status_code=404, detail="product not found")

    for index, image_id in enumerate(image_ids):
        try:
            await db.productimage.update(
                where={"id": image_id},
                data={"order": index}
            )
        except Exception as e:
            logger.error(e)
            raise HTTPException(status_code=400, detail=str(e))

    await index_product(product_id=id)
    return Message(message="Image re-ordered successfully.")

@router.post("/reindex")
async def reindex_products(background_tasks: BackgroundTasks) -> Message:
    """
    Re-index all products in the db to Meilisearch.
    """
    try:
        background_tasks.add_task(index_products)
        return Message(message="Re-indexing task enqueued...........")
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )
