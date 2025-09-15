from fastapi import APIRouter, HTTPException, Query, Request, Depends, BackgroundTasks
from typing import List
from app.models.collection import (
    SharedCollections, SharedCollectionCreate, SharedCollectionUpdate,
    SharedCollection, SharedCollectionView, Catalog, SharedCollectionBulkAdd
)
from app.prisma_client import prisma as db
from app.services.shared_collection import SharedCollectionService
from math import ceil
from app.services.redis import cache_response, invalidate_list
from app.services.product import reindex_catalog
from app.core.deps import get_current_superuser, UserDep
from app.models.generic import Message

from app.core.logging import get_logger
from app.core.utils import slugify, url_to_list
from app.services.meilisearch import get_or_create_index, ensure_index_ready
from app.core.config import settings
from meilisearch.errors import MeilisearchApiError
from app.services.websocket import manager

logger = get_logger(__name__)

router = APIRouter()

async def invalidate_catalog():
    await invalidate_list("catalog")
    await manager.broadcast_to_all(
            data={
                "key": "catalog",
            },
            message_type="invalidate",
        )


@router.get("/views", response_model=List[SharedCollectionView])
async def list_shared_collection_views():
    return await db.sharedcollectionview.find_many()


@router.delete("/views/{id}")
async def delete_shared_collection_view(id: int):
    obj = await db.sharedcollectionview.find_unique(where={"id": id})
    if not obj:
        raise HTTPException(status_code=404, detail="SharedCollectionView not found")
    await db.sharedcollectionview.delete(where={"id": id})
    return None


# Catalogs
@router.get("/", dependencies=[Depends(get_current_superuser)], response_model=SharedCollections)
@cache_response(key_prefix="catalog")
async def list_shared_collections(
    request: Request,
    query: str = "",
    product_id: int | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, le=100),
):
    filters = []
    if query:
        filters.append(f"(sc.title ILIKE '%{query}%' OR sc.slug ILIKE '%{query}%')")
    if product_id:
        filters.append(f"EXISTS (SELECT 1 FROM _SharedCollectionProducts ps WHERE ps.\"B\" = sc.id AND ps.\"A\" = {product_id})")

    where_clause = " AND ".join(filters) if filters else "TRUE"

    shared_rows = await db.query_raw(
        f"""
        SELECT sc.id, sc.slug, sc.title, sc.description, sc.is_active, sc.view_count,
               COUNT(ps."A") AS products_count
        FROM "shared_collections" sc
        LEFT JOIN "_SharedCollectionProducts" ps ON sc.id = ps."B"
        WHERE {where_clause}
        GROUP BY sc.id
        ORDER BY sc.created_at DESC
        OFFSET {skip}
        LIMIT {limit}
        """
    )

    shared_transformed = [
        SharedCollection(
            id=row["id"],
            slug=row["slug"],
            title=row["title"],
            description=row["description"],
            is_active=row["is_active"],
            view_count=row["view_count"],
            products_count=row["products_count"],
            products=[],
        )
        for row in shared_rows
    ]

    total_result = await db.query_raw(
        f"""
        SELECT COUNT(*)::int AS count
        FROM (
            SELECT sc.id
            FROM "shared_collections" sc
            WHERE {where_clause}
        ) sub
        """
    )
    total = total_result[0]["count"]

    return {
        "shared": shared_transformed,
        "skip": skip,
        "limit": limit,
        "total_pages": ceil(total / limit) if limit else 1,
        "total_count": total,
    }

@router.get("/{slug}")
@cache_response(key_prefix="product:catalog")
async def search(
    request: Request,
    slug: str,
    user: UserDep,
    search: str = "",
    sort: str = "created_at:desc",
    categories: str = Query(default=""),
    collections: str = Query(default=""),
    max_price: int = Query(default=1000000, gt=0),
    min_price: int = Query(default=1, gt=0),
    sizes: str = Query(default=""),
    colors: str = Query(default=""),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, le=100),
) -> Catalog:
    """
    Retrieve products using Meilisearch, sorted by latest.
    """
    where = {"slug": slug}
    if user is None or user.role != "ADMIN":
        where["is_active"] = True
    obj = await db.sharedcollection.find_unique(where=where)
    if not obj:
        raise HTTPException(status_code=404, detail="SharedCollection not found")

    filters = [f"catalogs_slugs IN [{slug}]"]
    if categories:
        filters.append(f"category_slugs IN {url_to_list(categories)}")
    if collections:
        filters.append(f"collection_slugs IN [{collections}]")
    if min_price and max_price:
        filters.append(
            f"min_variant_price >= {min_price} AND max_variant_price <= {max_price}")
    if sizes:
        filters.append(f"sizes IN [{sizes}]")
    if colors:
        filters.append(f"colors IN [{colors}]")

    search_params = {
        "limit": limit,
        "offset": skip,
        "sort": [sort],
    }

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

    except MeilisearchApiError as e:
        error_code = getattr(e, "code", None)
        if error_code in {"invalid_search_facets", "invalid_search_filter", "invalid_search_sort"}:
            logger.warning(f"Invalid filter detected, attempting to auto-configure filterable attributes: {e}")

            ensure_index_ready(index)

            search_results = index.search(
                search,
                {
                    **search_params
                }
            )
        logger.error(f"Meilisearch error: {e}")
        raise HTTPException(status_code=502, detail="Search service temporarily unavailable")
    except Exception as e:
        logger.error(e)
        raise HTTPException(
            status_code=400,
            detail=e.message
        )

    total_count = search_results["estimatedTotalHits"]
    total_pages = (total_count // limit) + (total_count % limit > 0)

    return {
        "title": obj.title,
        "description": obj.description,
        "is_active": obj.is_active,
        "view_count": obj.view_count,
        "products": search_results["hits"],
        "skip": skip,
        "limit": limit,
        "total_count": total_count,
        "total_pages": total_pages,
    }


@router.post("/{slug}/track-visit")
async def track_shared_collection_visit(
    request: Request,
    slug: str,
    user: UserDep,
) -> dict:
    """
    Track a unique visit to a shared collection.
    """
    where = {"slug": slug}
    if user is None or user.role != "ADMIN":
        where["is_active"] = True

    obj = await db.sharedcollection.find_unique(where=where)
    if not obj:
        raise HTTPException(status_code=404, detail="Catalog not found")

    client_ip = request.client.host
    if "x-forwarded-for" in request.headers:
        client_ip = request.headers["x-forwarded-for"].split(",")[0].strip()

    user_agent = request.headers.get("user-agent")

    is_new_visit = await SharedCollectionService.track_visit(
        shared_collection_id=obj.id,
        user_id=user.id if user else None,
        ip_address=client_ip,
        user_agent=user_agent
    )

    if is_new_visit:
        await invalidate_catalog()

    return {
        "success": True,
        "is_new_visit": is_new_visit,
    }

@router.post("/")
async def create_shared_collection(data: SharedCollectionCreate):
    create_data = data.model_dump(exclude_unset=True)

    if data.products is not None:
        create_data["products"] = {"connect": [{"id": id} for id in data.products]}

    create_data["slug"] = slugify(data.title)
    res = await db.sharedcollection.create(data=create_data)

    await invalidate_catalog()
    return res

@router.patch("/{id}")
async def update_shared_collection(id: int, data: SharedCollectionUpdate):
    obj = await db.sharedcollection.find_unique(where={"id": id})
    if not obj:
        raise HTTPException(status_code=404, detail="SharedCollection not found")

    update_data = data.model_dump(exclude_unset=True)
    if data.products is not None:
        product_connect = [{"id": id} for id in data.products]
        update_data["products"] = {"set": product_connect}
    res = await db.sharedcollection.update(where={"id": id}, data=update_data)

    await invalidate_catalog()

    return res

@router.delete("/{id}")
async def delete_shared_collection(id: int) -> Message:
    obj = await db.sharedcollection.find_unique(where={"id": id})
    if not obj:
        raise HTTPException(status_code=404, detail="SharedCollection not found")
    await db.sharedcollection.delete(where={"id": id})

    await invalidate_catalog()
    return {"message": "SharedCollection deleted successfully"}

@router.post("/{id}/add-product/{product_id}", dependencies=[Depends(get_current_superuser)])
async def add_product_to_shared_collection(id: int, product_id: int, background_tasks: BackgroundTasks) -> Message:
    """Add a product to a shared collection"""
    shared_collection = await db.sharedcollection.find_unique(where={"id": id})
    if not shared_collection:
        raise HTTPException(status_code=404, detail="SharedCollection not found")

    product = await db.product.find_unique(where={"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    await db.sharedcollection.update(
        where={"id": id},
        data={"products": {"connect": {"id": product_id}}}
    )

    background_tasks.add_task(reindex_catalog, product_id=product_id)

    return {"message": "Product added to collection successfully"}

@router.delete("/{id}/remove-product/{product_id}", dependencies=[Depends(get_current_superuser)])
async def remove_product_from_shared_collection(id: int, product_id: int, background_tasks: BackgroundTasks) -> Message:
    """Remove a product from a shared collection"""
    shared_collection = await db.sharedcollection.find_unique(where={"id": id})
    if not shared_collection:
        raise HTTPException(status_code=404, detail="SharedCollection not found")

    await db.sharedcollection.update(
        where={"id": id},
        data={
            "products": {
                "disconnect": {"id": product_id}
            }
        }
    )

    background_tasks.add_task(reindex_catalog, product_id=product_id)

    return {"message": "Product removed from collection successfully"}


@router.post("/{id}/add-products", dependencies=[Depends(get_current_superuser)])
async def bulk_add_products_to_shared_collection(id: int, data: SharedCollectionBulkAdd, background_tasks: BackgroundTasks) -> Message:
    """Bulk add products to a shared collection"""
    shared_collection = await db.sharedcollection.find_unique(where={"id": id})
    if not shared_collection:
        raise HTTPException(status_code=404, detail="SharedCollection not found")

    if not data.product_ids:
        raise HTTPException(status_code=400, detail="No product_ids provided")

    # Connect many products at once
    await db.sharedcollection.update(
        where={"id": id},
        data={"products": {"connect": [{"id": pid} for pid in data.product_ids]}}
    )

    # Reindex all a bit later; enqueue per product
    for pid in data.product_ids:
        background_tasks.add_task(reindex_catalog, product_id=pid)

    await invalidate_catalog()
    return {"message": f"Added {len(data.product_ids)} product(s) to collection"}
