from fastapi import APIRouter, HTTPException, status, Query, Request
from typing import List
from app.models.collection import (
    SharedCollections, SharedCollectionCreate, SharedCollectionUpdate,
    SharedCollection, SharedCollectionView, SharedCollectionViewCreate
)
from app.prisma_client import prisma as db
from math import ceil
from app.services.redis import cache_response

router = APIRouter()


@router.get("/views", response_model=List[SharedCollectionView])
async def list_shared_collection_views():
    return await db.sharedcollectionview.find_many()

@router.post("/views", response_model=SharedCollectionView, status_code=status.HTTP_201_CREATED)
async def create_shared_collection_view(data: SharedCollectionViewCreate):
    return await db.sharedcollectionview.create(data=data.model_dump())


@router.delete("/views/{id}", status_code=status.HTTP_204_NO_CONTENT)
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
    )
    total = await db.sharedcollection.count(where=where_clause)
    return {
        "shared":shared,
        "page":page,
        "limit":limit,
        "total_pages":ceil(total/limit),
        "total_count":total,
    }

@router.get("/{slug}")
# @cache_response(key_prefix="shared", key=lambda request, slug: slug)
async def get_shared_collection(request: Request, slug: str):
    obj = await db.sharedcollection.find_unique(where={"slug": slug}, include={"products": {"include": {"images": True, "variants": True}}})
    if not obj:
        raise HTTPException(status_code=404, detail="SharedCollection not found")
    return obj

@router.post("/", response_model=SharedCollection, status_code=status.HTTP_201_CREATED)
async def create_shared_collection(data: SharedCollectionCreate):
    if data.product_ids:
        product_connect = [{"id": id} for id in data.product_ids]
        data["products"] = {"connect": product_connect}
    return await db.sharedcollection.create(data=data.model_dump())

@router.put("/{id}", response_model=SharedCollection)
async def update_shared_collection(id: int, data: SharedCollectionUpdate):
    obj = await db.sharedcollection.find_unique(where={"id": id})
    if not obj:
        raise HTTPException(status_code=404, detail="SharedCollection not found")
    if data.product_ids is not None:
        product_connect = [{"id": id} for id in data.product_ids]
        data["products"] = {"connect": product_connect}
    return await db.sharedcollection.update(where={"id": id}, data=data.model_dump(exclude_unset=True))

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_shared_collection(id: int):
    obj = await db.sharedcollection.find_unique(where={"id": id})
    if not obj:
        raise HTTPException(status_code=404, detail="SharedCollection not found")
    await db.sharedcollection.delete(where={"id": id})
    return None
