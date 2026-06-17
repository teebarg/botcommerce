import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, Response, Request
from app.core.config import settings
from app.core.logging import get_logger
from app.core.dependencies.product import ProductDep, SearchDep
from app.services.cache import cacheable
from app.core.deps import CurrentUser, UserDep
from app.models.generic import Message
from app.models.product import ProductLite, VariantWithStatus, SearchProducts, FeedProducts, IndexProducts, ReviewStatus
from app.core.permissions import require_admin
from app.services.cache import DEFAULT_EXPIRATION, EnhancedJSONEncoder

logger = get_logger(__name__)

router = APIRouter()

@router.get("/google-merchant-feed.xml")
async def get_google_merchant_feed(request: Request, srv: ProductDep) -> Response:
    xml_content = await srv.generate_merchant_feed_xml(request=request)
    return Response(content=xml_content, media_type="application/xml")


@router.get("/{product_id}/review-status")
@cacheable(key_prefix="review-status", key_builder=lambda product_id: product_id)
async def get_review_status(request: Request, product_id: int, user: UserDep, srv: ProductDep) -> ReviewStatus:
    if not user:
        return ReviewStatus(has_purchased=False, has_reviewed=False)

    has_purchased, has_reviewed = await srv.check_review_status(user.id, product_id)
    return ReviewStatus(has_purchased=has_purchased, has_reviewed=has_reviewed)


@router.get("/{id}/similar")
@cacheable(key_prefix="product:similar", tags=lambda id: ["product:{id}"])
async def recommend(request: Request, srv: ProductDep, id: int, limit: int = Query(default=20, le=100)):
    items = await srv.get_similar_products(product_id=id, limit=limit)
    return {"similar": items}


@router.get("/recommend")
@cacheable(key_prefix="products:recommendation", tags=["products"])
async def get_recommendations(
    request: Request, srv: ProductDep, user: CurrentUser, limit: int = Query(default=20, le=100),
):
    items = await srv.get_personalized_recommendations(user_id=user.id, limit=limit)
    return {"recommended": items}


@router.get("/feed")
@cacheable(key_prefix="products:list", tags=["products"])
async def feed(
    request: Request, srv: ProductDep, search: str = "", sort: str = "id:desc",
    cat_ids: str = Query(default=""), collections: str = Query(default=""),
    max_price: int = Query(default=50000, gt=0), min_price: int = Query(default=1, gt=0),
    sizes: str = Query(default=""), colors: str = Query(default=""), ages: str = Query(default=""),
    width: str = Query(default=""), length: str = Query(default=""),
    limit: int = Query(default=20, le=100), active: bool = Query(default=True),
    feed_seed: Optional[int] = Query(default=None), cursor: Optional[str] = Query(default=None),
) -> FeedProducts:
    return await srv.get_discovery_feed(
        search=search, sort=sort, cat_ids=cat_ids, collections=collections,
        max_price=max_price, min_price=min_price, sizes=sizes, colors=colors,
        ages=ages, width=width, length=length, limit=limit, active=active,
        feed_seed=feed_seed, cursor=cursor
    )


@router.get("/index-products")
@cacheable(key_prefix="products", key_builder="collections", tags=["products"])
async def get_index_products(request: Request, srv: ProductDep) -> IndexProducts:
    return await srv.query_collection_index()


@router.get("/")
@cacheable(key_prefix="products:search", tags=["products"])
async def search(
    request: Request, srv: ProductDep, search: str = "",
    collections: str = Query(default=""),
    skip: int = Query(default=0, ge=0), limit: int = Query(default=20, le=100),
) -> SearchProducts:
    res = await srv.get_discovery_feed(
        search=search, sort="id:desc", collections=collections,
        limit=limit, cursor=None, skip_offset=skip
    )

    total_count = res["total_count"]
    total_pages = (total_count // limit) + (total_count % limit > 0)

    return {
        "products": res["products"], "skip": skip,
        "limit": limit, "total_count": total_count, "total_pages": total_pages
    }


@router.get("/{slug}")
async def read(request: Request, slug: str, srv: ProductDep) -> ProductLite:
    cache_key = f"product:slug:{slug}"
    cached = await srv.redis.get(cache_key)
    if cached:
        return json.loads(cached)

    product = await srv.get_by_slug(slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    new_product = ProductLite.validate(product)
    
    async with srv.redis.pipeline(transaction=False) as pipe:
        pipe.setex(cache_key, DEFAULT_EXPIRATION, json.dumps(new_product, cls=EnhancedJSONEncoder))
        pipe.sadd(f"tag:product:{product.id}", cache_key)
        pipe.expire(f"tag:product:{product.id}", DEFAULT_EXPIRATION)
        await pipe.execute()

    return new_product


@router.put("/variants/{variant_id}", dependencies=[Depends(require_admin)])
async def update_variant(
    variant_id: int, variant: VariantWithStatus, srv: ProductDep, background_tasks: BackgroundTasks,
):
    existing_variant = await srv.get_variant(variant_id=variant_id)
    if not existing_variant:
        raise HTTPException(status_code=404, detail="Variant not found")

    update_fields = ["price", "old_price", "inventory", "size", "color", "width", "length", "age"]
    update_data = {f: getattr(variant, f) for f in update_fields if getattr(variant, f, None) is not None}

    if "inventory" in update_data:
        update_data["status"] = "IN_STOCK" if update_data["inventory"] > 0 else "OUT_OF_STOCK"

    try:
        updated_variant = await srv.update_variant(variant_id=variant_id, update_data=update_data)
        background_tasks.add_task(srv.invalidate, product_id=existing_variant.product_id)
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=400, detail=str(e))

    return updated_variant


@router.post("/configure-filterable-attributes")
async def configure_filterable_attributes(search_srv: SearchDep) -> Message:
    try:
        search_srv.update_settings()
        return Message(message="Filterable attributes updated successfully.")
    except Exception as e:
        logger.error(f"Error updating attributes: {e}")
        raise HTTPException(status_code=500, detail="Configuration task error.")


@router.get("/search/clear-index", dependencies=[Depends(require_admin)])
async def config_clear_index(search_srv: SearchDep):
    try:
        await search_srv.clear_index(settings.MEILI_PRODUCTS_INDEX)
        return {"message": "Index cleared"}
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search/delete-index", dependencies=[Depends(require_admin)])
async def config_delete_index(index_name: str, search_srv: SearchDep):
    try:
        search_srv.delete_index(index_name)
        return {"message": "Index dropped"}
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reindex")
async def reindex_products(srv: ProductDep, background_tasks: BackgroundTasks) -> Message:
    try:
        background_tasks.add_task(srv.invalidate_all)
        return Message(message="Re-indexing task enqueued...........")
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail=str(e))