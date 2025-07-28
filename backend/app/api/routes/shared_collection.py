from fastapi import APIRouter, HTTPException, Query, Request, Depends
from typing import List
from app.models.collection import (
    SharedCollections, SharedCollectionCreate, SharedCollectionUpdate,
    SharedCollection, SharedCollectionView
)
from app.prisma_client import prisma as db
from app.services.shared_collection import SharedCollectionService
from math import ceil
from app.services.redis import cache_response
from app.services.product import to_product_card_view
from app.core.utils import slugify
from app.core.deps import RedisClient, get_current_superuser, UserDep
from app.models.generic import Message
from app.core.logging import logger

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
    page: int = Query(default=1, gt=0),
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
        skip=(page - 1) * limit,
        take=limit,
        order={"created_at": "desc"},
        include={
            "products": {
                "include": {
                    "images": True,
                    "variants": True,
                    "collections": True,
                    "brand": True,
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
        "page":page,
        "limit":limit,
        "total_pages":ceil(total/limit),
        "total_count":total,
    }

@router.get("/{slug}")
@cache_response(key_prefix="sharedcollection", key=lambda request, slug, user: slug)
async def get_shared_collection(request: Request, slug: str, user: UserDep) -> SharedCollection:
    where={"slug": slug}
    if user is None or user.role != "ADMIN":
        where["is_active"] = True
    obj = await db.sharedcollection.find_unique(where=where,
        include={
            "products": {
                "include": {
                    "images": True,
                    "variants": True,
                    "collections": True,
                    "brand": True,
                    "categories": True,
                    "reviews": True
                }
            },
        },
    )
    if not obj:
        raise HTTPException(status_code=404, detail="SharedCollection not found")
    transformed_products = [to_product_card_view(p) for p in obj.products]
    obj.products = transformed_products
    return obj


@router.post("/{slug}/track-visit")
async def track_shared_collection_visit(
    request: Request, 
    slug: str, 
    user: UserDep,
    cache: RedisClient
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
        await cache.invalidate_list_cache("shared")
        await cache.bust_tag(f"sharedcollection:{slug}")
    
    return {
        "success": True,
        "is_new_visit": is_new_visit,
    }

@router.post("/")
async def create_shared_collection(data: SharedCollectionCreate, cache: RedisClient):
    create_data = data.model_dump(exclude_unset=True)
    if data.products:
        product_connect = [{"id": id} for id in data.products]
        create_data["products"] = {"connect": product_connect}
    create_data["slug"] = slugify(data.title)
    res = await db.sharedcollection.create(data=create_data)
    await cache.invalidate_list_cache("shared")
    return res

@router.patch("/{id}")
async def update_shared_collection(id: int, data: SharedCollectionUpdate, cache: RedisClient):
    obj = await db.sharedcollection.find_unique(where={"id": id})
    update_data = data.model_dump(exclude_unset=True)
    if not obj:
        raise HTTPException(status_code=404, detail="SharedCollection not found")
    if data.products is not None:
        product_connect = [{"id": id} for id in data.products]
        update_data["products"] = {"set": product_connect}
    res = await db.sharedcollection.update(where={"id": id}, data=update_data)
    await cache.invalidate_list_cache("shared")
    await cache.bust_tag(f"sharedcollection:{res.slug}")
    return res

@router.delete("/{id}")
async def delete_shared_collection(id: int, cache: RedisClient) -> Message:
    obj = await db.sharedcollection.find_unique(where={"id": id})
    if not obj:
        raise HTTPException(status_code=404, detail="SharedCollection not found")
    await db.sharedcollection.delete(where={"id": id})
    await cache.invalidate_list_cache("shared")
    await cache.bust_tag(f"sharedcollection:{obj.slug}")
    return {"message": "SharedCollection deleted successfully"}
