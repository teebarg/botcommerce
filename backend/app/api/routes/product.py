import json
from typing import Optional
from app.core.config import settings
from app.core.logging import get_logger
from app.core.dependencies.product import get_product_service
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, Response, Request

from app.core.deps import CurrentUser, UserDep
from app.models.generic import Message
from app.models.product import ProductLite, VariantWithStatus, SearchProducts, FeedProducts, IndexProducts, ReviewStatus
from app.core.permissions import require_admin
from app.prisma_client import prisma as db
from app.services.product import ProductService
from app.services.redis import DEFAULT_EXPIRATION, EnhancedJSONEncoder, cache_response
from app.services.product import index_product, index_products

logger = get_logger(__name__)

router = APIRouter()

@router.get("/google-merchant-feed.xml")
async def get_google_merchant_feed(
    request: Request,
    service: ProductService = Depends(get_product_service)
) -> Response:
    xml_content = await service.generate_merchant_feed_xml(request=request)
    return Response(content=xml_content, media_type="application/xml")


@router.get("/{product_id}/review-status")
@cache_response("review-status")
async def get_review_status(
    request: Request, product_id: int, user: UserDep,
    service: ProductService = Depends(get_product_service)
) -> ReviewStatus:
    if not user:
        return ReviewStatus(has_purchased=False, has_reviewed=False)

    has_purchased, has_reviewed = await service.repo.check_review_status(user.id, product_id)
    return ReviewStatus(has_purchased=has_purchased, has_reviewed=has_reviewed)


@router.get("/{id}/similar")
@cache_response(key_prefix="product:similar", key=lambda request, id, limit: f"{id}:{limit}", tags=["products", "product:{id}"])
async def recommend(
    request: Request, id: int, limit: int = Query(default=20, le=100),
    service: ProductService = Depends(get_product_service)
):
    items = await service.get_similar_products(product_id=id, limit=limit)
    return {"similar": items}


@router.get("/recommend")
@cache_response("products:recommendation", tags=["products"])
async def get_recommendations(
    request: Request, user: CurrentUser, limit: int = Query(default=20, le=100),
    service: ProductService = Depends(get_product_service)
):
    items = await service.get_personalized_recommendations(user_id=user.id, limit=limit)
    return {"recommended": items}


@router.get("/feed")
@cache_response("products:list", tags=["products"])
async def feed(
    request: Request, search: str = "", sort: str = "id:desc",
    cat_ids: str = Query(default=""), collections: str = Query(default=""),
    max_price: int = Query(default=50000, gt=0), min_price: int = Query(default=1, gt=0),
    sizes: str = Query(default=""), colors: str = Query(default=""), ages: str = Query(default=""),
    width: str = Query(default=""), length: str = Query(default=""),
    limit: int = Query(default=20, le=100), active: bool = Query(default=True),
    show_suggestions: bool = Query(default=False), show_facets: bool = Query(default=False),
    feed_seed: Optional[float] = Query(default=None), cursor: Optional[str] = Query(default=None),
    service: ProductService = Depends(get_product_service)
) -> FeedProducts:
    return await service.get_discovery_feed(
        search=search, sort=sort, cat_ids=cat_ids, collections=collections,
        max_price=max_price, min_price=min_price, sizes=sizes, colors=colors,
        ages=ages, width=width, length=length, limit=limit, active=active,
        show_suggestions=show_suggestions, show_facets=show_facets, feed_seed=feed_seed, cursor=cursor
    )


@router.get("/index-products")
@cache_response("products:collection", tags=["products"])
async def get_index_products(
    request: Request,
    service: ProductService = Depends(get_product_service)
) -> IndexProducts:
    return await service.query_collection_index()


@router.get("/")
@cache_response("products:search", tags=["products"])
async def search(
    request: Request, search: str = "", sort: str = "id:desc",
    cat_ids: str = Query(default=""), collections: str = Query(default=""),
    max_price: int = Query(default=50000, gt=0), min_price: int = Query(default=1, gt=0),
    sizes: str = Query(default=""), colors: str = Query(default=""), ages: str = Query(default=""),
    width: str = Query(default=""), length: str = Query(default=""),
    skip: int = Query(default=0, ge=0), limit: int = Query(default=20, le=100), active: bool = Query(default=True),
    show_suggestions: bool = Query(default=False), show_facets: bool = Query(default=False),
    service: ProductService = Depends(get_product_service)
) -> SearchProducts:
    res = await service.get_discovery_feed(
        search=search, sort=sort, cat_ids=cat_ids, collections=collections,
        max_price=max_price, min_price=min_price, sizes=sizes, colors=colors,
        ages=ages, width=width, length=length, limit=limit, active=active,
        show_suggestions=show_suggestions, show_facets=show_facets, cursor=None, skip_offset=skip
    )

    total_count = res["total_count"]
    total_pages = (total_count // limit) + (total_count % limit > 0)

    return {
        "products": res["products"], "facets": res["facets"], "skip": skip,
        "limit": limit, "total_count": total_count, "total_pages": total_pages,
        "suggestions": res["suggestions"]
    }


@router.get("/{slug}")
async def read(
    request: Request, slug: str,
    service: ProductService = Depends(get_product_service)
) -> ProductLite:
    cache_key = f"product:slug:{slug}"
    cached = await service.repo.redis.get(cache_key)
    if cached:
        return json.loads(cached)

    product = await service.repo.get_by_slug(slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    async with service.repo.redis.pipeline(transaction=False) as pipe:
        pipe.setex(cache_key, DEFAULT_EXPIRATION, json.dumps(product, cls=EnhancedJSONEncoder))
        pipe.sadd(f"tag:product:{product.id}", cache_key)
        pipe.expire(f"tag:product:{product.id}", DEFAULT_EXPIRATION)
        await pipe.execute()

    return product


@router.put("/variants/{variant_id}", dependencies=[Depends(require_admin)])
async def update_variant(
    variant_id: int, variant: VariantWithStatus, background_tasks: BackgroundTasks,
):
    existing_variant = await db.productvariant.find_unique(where={"id": variant_id})
    if not existing_variant:
        raise HTTPException(status_code=404, detail="Variant not found")

    update_fields = ["price", "old_price", "inventory", "size", "color", "width", "length", "age"]
    update_data = {f: getattr(variant, f) for f in update_fields if getattr(variant, f, None) is not None}

    if "inventory" in update_data:
        update_data["status"] = "IN_STOCK" if update_data["inventory"] > 0 else "OUT_OF_STOCK"

    try:
        updated_variant = await db.productvariant.update(where={"id": variant_id}, data=update_data)
        background_tasks.add_task(index_product, product_id=existing_variant.product_id)
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e))

    return updated_variant


@router.post("/configure-filterable-attributes")
async def configure_filterable_attributes(
    service: ProductService = Depends(get_product_service)
) -> Message:
    try:
        service.search_repo.update_settings()
        return Message(message="Filterable attributes updated successfully.")
    except Exception as e:
        logger.error(f"Error updating attributes: {e}")
        raise HTTPException(status_code=500, detail="Configuration task error.")


@router.get("/search/clear-index", dependencies=[Depends(require_admin)])
async def config_clear_index():
    from app.services.meilisearch import clear_index
    try:
        await clear_index(settings.MEILI_PRODUCTS_INDEX)
        return {"message": "Index cleared"}
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search/delete-index", dependencies=[Depends(require_admin)])
async def config_delete_index(index_name: str):
    from app.services.meilisearch import delete_index
    try:
        delete_index(index_name)
        return {"message": "Index dropped"}
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reindex")
async def reindex_products(background_tasks: BackgroundTasks) -> Message:
    try:
        background_tasks.add_task(index_products)
        return Message(message="Re-indexing task enqueued...........")
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))