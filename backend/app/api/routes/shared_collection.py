from fastapi import APIRouter, HTTPException, Query, Request, Depends, BackgroundTasks
from typing import List
from app.models.collection import (
    SharedCollections, SharedCollectionCreate, SharedCollectionUpdate,
    SharedCollection, SharedCollectionView, Catalog
)
from app.prisma_client import prisma as db
from app.services.shared_collection import SharedCollectionService
from math import ceil
from app.services.redis import cache_response, invalidate_list, bust
from app.services.product import to_product_card_view, index_products
from app.core.deps import get_current_superuser, UserDep
from app.models.generic import Message

from app.core.logging import get_logger
from app.core.utils import slugify, url_to_list
from app.services.meilisearch import get_or_create_index, ensure_index_ready
from app.core.config import settings
from meilisearch.errors import MeilisearchApiError

logger = get_logger(__name__)

router = APIRouter()


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

@router.get("/", dependencies=[Depends(get_current_superuser)], response_model=SharedCollections)
@cache_response(key_prefix="shared")
async def list_shared_collections(
    request: Request,
    query: str = "",
    product_id: int | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, le=100)
):
    where_clause = {}
    if query:
        where_clause["OR"] = [
                {"title": {"contains": query, "mode": "insensitive"}},
                {"slug": {"contains": query, "mode": "insensitive"}}
            ]
    if product_id:
        where_clause["AND"] = [
                {"products": {"some": {"id": product_id}}}
            ]
    shared = await db.sharedcollection.find_many(
        where=where_clause,
        skip=skip,
        take=limit,
        order={"created_at": "desc"},
        include={
            "products": {
                "include": {
                    "images": True,
                    "variants": True,
                    "collections": True,
                    "categories": True,
                    "reviews": True
                }
            }
        }
    )
    shared_transformed = [
        SharedCollection(
            id=col.id,
            slug=col.slug,
            title=col.title,
            description=col.description,
            is_active=col.is_active,
            view_count=col.view_count,
            products=[to_product_card_view(p) for p in col.products]
        )
        for col in shared
    ]
    total = await db.sharedcollection.count(where=where_clause)
    return {
        "shared":shared_transformed,
        "skip":skip,
        "limit":limit,
        "total_pages":ceil(total/limit),
        "total_count":total,
    }

@router.get("/{slug}")
@cache_response(key_prefix="sharedcollection")
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


# @router.get("/{slug}")
# @cache_response(key_prefix="sharedcollection", key=lambda request, slug, user: slug)
# async def get_shared_collection(request: Request, slug: str, user: UserDep) -> SharedCollection:
#     where={"slug": slug}
#     if user is None or user.role != "ADMIN":
#         where["is_active"] = True
#     obj = await db.sharedcollection.find_unique(where=where,
#         include={
#             "products": {
#                 "include": {
#                     "images": True,
#                     "variants": True,
#                     "collections": True,
#                     "categories": True,
#                     "reviews": True
#                 }
#             },
#         },
#     )
#     if not obj:
#         raise HTTPException(status_code=404, detail="SharedCollection not found")
#     transformed_products = [to_product_card_view(p) for p in obj.products]
#     obj.products = transformed_products
#     return obj


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
        raise HTTPException(status_code=404, detail="SharedCollection not found")

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
        await invalidate_list("shared")
        await bust(f"sharedcollection:{slug}")

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

    await invalidate_list("shared")
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

    await invalidate_list("shared")
    await bust(f"sharedcollection:{obj.slug}")
    return res

@router.delete("/{id}")
async def delete_shared_collection(id: int) -> Message:
    obj = await db.sharedcollection.find_unique(where={"id": id})
    if not obj:
        raise HTTPException(status_code=404, detail="SharedCollection not found")
    await db.sharedcollection.delete(where={"id": id})

    await invalidate_list("shared")
    await bust(f"sharedcollection:{obj.slug}")
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

    existing_product = await db.sharedcollection.find_first(
        where={
            "id": id,
            "products": {
                "some": {"id": product_id}
            }
        }
    )

    if existing_product:
        raise HTTPException(status_code=400, detail="Product is already in this collection")

    await db.sharedcollection.update(
        where={"id": id},
        data={
            "products": {
                "connect": {"id": product_id}
            }
        }
    )

    background_tasks.add_task(index_products)

    await invalidate_list("sharedcollection")
    await invalidate_list("shared")
    await bust(f"sharedcollection:{shared_collection.slug}")

    return {"message": "Product added to collection successfully"}

@router.delete("/{id}/remove-product/{product_id}", dependencies=[Depends(get_current_superuser)])
async def remove_product_from_shared_collection(id: int, product_id: int) -> Message:
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

    await invalidate_list("shared")
    await bust(f"sharedcollection:{shared_collection.slug}")

    return {"message": "Product removed from collection successfully"}
