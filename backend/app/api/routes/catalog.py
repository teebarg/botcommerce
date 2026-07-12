from fastapi import APIRouter, HTTPException, Query, Request, Depends
from typing import List, Optional
from app.prisma_client import prisma as db
from app.core.dependencies.services import CatalogDep
from app.core.deps import UserDep
from app.models.generic import Message
from app.core.logging import get_logger
from app.core.utils import slugify, get_client_ip
from app.services.websocket import manager
from app.models.catalog import Catalog, Catalogs, CatalogView, CursorPaginatedCatalog, CatalogCreate, CatalogUpdate, CatalogBulkAdd
from app.core.permissions import require_admin
from app.services.cache import cacheable
from app.models.product import ProductSearch, SearchVariant

logger = get_logger(__name__)

router = APIRouter()


@router.get("/views")
async def list_catalogs_views() -> List[CatalogView]:
    return await db.sharedcollectionview.find_many()


@router.get("/", dependencies=[Depends(require_admin)])
@cacheable(key_prefix="catalogs", tags=["catalogs"], cdn_ttl=30, cdn_swr=300)
async def list_catalogs(
    request: Request,
    srv: CatalogDep,
    is_active: bool | None = None,
    product_id: int | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, le=100),
) -> Catalogs:
    return await srv.list(
        skip=skip,
        limit=limit,
        is_active=is_active,
        product_id=product_id,
    )


@router.get("/{slug}")
@cacheable(key_prefix="catalog", tags=lambda slug: ["catalog", f"catalog:{slug}"])
async def search(
    request: Request,
    slug: str,
    user: UserDep,
    limit: int = Query(default=20, le=100),
    cursor: Optional[int] = Query(default=None),
) -> CursorPaginatedCatalog:
    """Postgres keyset pagination (cursor-based) sorting by creation date."""
    catalog_where = {"slug": slug}
    if user is None or user.role != "ADMIN":
        catalog_where["is_active"] = True

    catalog = await db.sharedcollection.find_unique(where=catalog_where)
    if not catalog:
        raise HTTPException(status_code=404, detail="Catalog not found")

    # This filters down to products inside THIS specific catalog
    product_where = {
        "shared_collections": {
            "some": {
                "slug": slug
            }
        }
    }

    if user is None or user.role != "ADMIN":
        product_where["active"] = True

    products = await db.product.find_many(
        where=product_where,
        take=limit + 1,
        skip=1 if cursor else 0,
        cursor={"id": cursor} if cursor else None,
        order={"created_at": "desc"},
        include={"images": True, "variants": True}
    )

    has_more = len(products) > limit
    sliced_products = products[:limit]

    # Keyset cursor extraction
    next_cursor = sliced_products[-1].id if has_more and sliced_products else None

    formatted_products = []
    for p in sliced_products:
        variant_list = [
            SearchVariant(
                id=v.id,
                price=v.price,
                old_price=v.old_price,
                inventory=v.inventory,
                size=v.size,
                color=v.color,
                width=v.width,
                length=v.length,
                age=v.age
            )
            for v in p.variants
        ]

        # Determine overall product stock status based on variant availability
        product_status = "OUT OF STOCK"
        if any(v.status == "IN_STOCK" and v.inventory > 0 for v in p.variants):
            product_status = "IN STOCK"

        formatted_products.append(
            ProductSearch(
                id=p.id,
                name=p.name,
                sku=p.sku,
                slug=p.slug,
                image=p.images[0].image if len(p.images) > 0 else p.image,
                status=product_status,
                variants=variant_list,
                active=p.active,
                is_new=p.is_new
            )
        )

    return {
        "title": catalog.title,
        "description": catalog.description,
        "is_active": catalog.is_active,
        "view_count": catalog.view_count,
        "products": formatted_products,
        "limit": limit,
        "next_cursor": next_cursor,
    }


@router.post("/{slug}/track-visit")
async def track_catalog_visit(
    request: Request,
    srv: CatalogDep,
    slug: str,
    user: UserDep,
) -> dict:
    """Track a unique visit to a catalog."""
    where = {"slug": slug}
    if user is None or user.role != "ADMIN":
        where["is_active"] = True

    obj = await db.sharedcollection.find_unique(where=where)
    if not obj:
        raise HTTPException(status_code=404, detail="Catalog not found")

    is_new_visit = await srv.track_visit(
        catalog_id=obj.id,
        user_id=user.id if user else None,
        ip_address=get_client_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    if is_new_visit:
        await srv.invalidate()

    return {"success": True, "is_new_visit": is_new_visit}


@router.post("/", dependencies=[Depends(require_admin)])
async def create_catalog(srv: CatalogDep, data: CatalogCreate) -> Catalog:
    create_data = data.model_dump(exclude_unset=True)
    create_data["slug"] = slugify(data.title)
    res = await db.sharedcollection.create(data=create_data)
    await srv.invalidate()
    return res


@router.patch("/{id}", dependencies=[Depends(require_admin)])
async def update_catalog(srv: CatalogDep, id: int, data: CatalogUpdate) -> Catalog:
    obj = await db.sharedcollection.find_unique(where={"id": id})
    if not obj:
        raise HTTPException(status_code=404, detail="Catalog not found")

    update_data = data.model_dump(exclude_unset=True)

    res = await db.sharedcollection.update(where={"id": id}, data=update_data)
    await srv.invalidate()
    return res


@router.delete("/{id}", dependencies=[Depends(require_admin)])
async def delete_catalog(id: int, srv: CatalogDep) -> Message:
    obj = await db.sharedcollection.find_unique(where={"id": id})
    if not obj:
        raise HTTPException(status_code=404, detail="Catalog not found")

    await db.sharedcollection.delete(where={"id": id})
    await srv.invalidate()
    return {"message": "Catalog deleted successfully"}


@router.post("/{id}/add-products", dependencies=[Depends(require_admin)])
async def bulk_add_products_to_catalog(id: int, srv: CatalogDep, data: CatalogBulkAdd) -> Message:
    """Bulk add products to a catalog"""
    catalog = await db.sharedcollection.find_unique(where={"id": id})
    if not catalog:
        raise HTTPException(status_code=404, detail="Catalog not found")

    if not data.product_ids:
        raise HTTPException(status_code=400, detail="No product_ids provided")

    await db.sharedcollection.update(
        where={"id": id},
        data={"products": {"connect": [{"id": pid} for pid in data.product_ids]}},
    )

    await manager.broadcast_to_all(data={"status": "completed"}, message_type="bulk_action")
    await srv.invalidate(slug=catalog.slug)
    return {"message": f"Added {len(data.product_ids)} product(s) to catalog"}


@router.post("/{id}/remove-products", dependencies=[Depends(require_admin)])
async def bulk_remove_products_from_catalog(id: int, srv: CatalogDep, data: CatalogBulkAdd) -> Message:
    """Bulk remove products from a catalog"""
    catalog = await db.sharedcollection.find_unique(where={"id": id})
    if not catalog:
        raise HTTPException(status_code=404, detail="Catalog not found")

    if not data.product_ids:
        raise HTTPException(status_code=400, detail="No product_ids provided")

    await db.sharedcollection.update(
        where={"id": id},
        data={"products": {"disconnect": [{"id": pid} for pid in data.product_ids]}},
    )

    await manager.broadcast_to_all(data={"status": "completed"}, message_type="bulk_action")
    await srv.invalidate(slug=catalog.slug)
    return {"message": f"Removed {len(data.product_ids)} product(s) from catalog"}
