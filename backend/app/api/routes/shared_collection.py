from fastapi import APIRouter, HTTPException, Query, Request
from typing import List
from app.models.collection import (
    SharedCollections, SharedCollectionCreate, SharedCollectionUpdate,
    SharedCollection, SharedCollectionView, SharedCollectionViewCreate
)
from app.prisma_client import prisma as db
from math import ceil
from app.services.redis import cache_response
from app.services.product import to_product_card_view
from app.core.utils import slugify
from app.core.deps import RedisClient

router = APIRouter()


@router.get("/views", response_model=List[SharedCollectionView])
async def list_shared_collection_views():
    return await db.sharedcollectionview.find_many()

@router.post("/views", response_model=SharedCollectionView)
async def create_shared_collection_view(data: SharedCollectionViewCreate):
    return await db.sharedcollectionview.create(data=data.model_dump())


@router.delete("/views/{id}")
async def delete_shared_collection_view(id: int):
    obj = await db.sharedcollectionview.find_unique(where={"id": id})
    if not obj:
        raise HTTPException(status_code=404, detail="SharedCollectionView not found")
    await db.sharedcollectionview.delete(where={"id": id})
    return None

@router.get("/", response_model=SharedCollections)
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
@cache_response(key_prefix="sharedcollection", key=lambda request, slug: slug)
async def get_shared_collection(request: Request, slug: str) -> SharedCollection:
    obj = await db.sharedcollection.find_unique(where={"slug": slug}, include={
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
    })
    if not obj:
        raise HTTPException(status_code=404, detail="SharedCollection not found")
    transformed_products = [to_product_card_view(p) for p in obj.products]
    obj.products = transformed_products
    return obj

@router.post("/", response_model=SharedCollection)
async def create_shared_collection(data: SharedCollectionCreate):
    if data.products:
        product_connect = [{"id": id} for id in data.products]
        data["products"] = {"connect": product_connect}
    data["slug"] = slugify(data.title)
    return await db.sharedcollection.create(data=data.model_dump())

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
    print(res)
    return res

@router.delete("/{id}")
async def delete_shared_collection(id: int, cache: RedisClient):
    obj = await db.sharedcollection.find_unique(where={"id": id})
    if not obj:
        raise HTTPException(status_code=404, detail="SharedCollection not found")
    await db.sharedcollection.delete(where={"id": id})
    await cache.invalidate_list_cache("shared")
    await cache.bust_tag(f"sharedcollection:{obj.slug}")
    return None
