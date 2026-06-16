from prisma.errors import PrismaError
from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List
from app.models.delivery import DeliveryOption, DeliveryOptionCreate, DeliveryOptionUpdate
from app.prisma_client import prisma as db
from app.models.generic import Message
from app.core.permissions import require_admin
from app.core.dependencies.cache import CacheDep
from app.services.cache import cacheable

router = APIRouter()

@router.get("/", response_model=List[DeliveryOption])
@cacheable(key_prefix="delivery", key_builder=False, expire=259200000)
async def get_delivery_options(request: Request):
    """Get all delivery options"""
    return await db.deliveryoption.find_many(order={"created_at": "desc"})

@router.post("/", dependencies=[Depends(require_admin)])
async def create_delivery_option(
    delivery_option: DeliveryOptionCreate,
    cache: CacheDep
) -> DeliveryOption:
    """Create a new delivery option"""
    existing = await db.deliveryoption.find_first(
        where={"method": delivery_option.method}
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Delivery option with method {delivery_option.method} already exists"
        )

    await cache.invalidate("delivery")

    return await db.deliveryoption.create(data=delivery_option.model_dump())

@router.patch("/{delivery_option_id}", dependencies=[Depends(require_admin)])
async def update_delivery_option(
    cache: CacheDep,
    delivery_option_id: int,
    delivery_option_update: DeliveryOptionUpdate,
) -> DeliveryOption:
    """Update a delivery option"""
    existing = await db.deliveryoption.find_unique(
        where={"id": delivery_option_id}
    )
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery option not found"
        )

    try:
        res = await db.deliveryoption.update(
            where={"id": delivery_option_id},
            data=delivery_option_update.model_dump(exclude_unset=True)
        )
        await cache.invalidate("delivery")
        return res
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{delivery_option_id}", dependencies=[Depends(require_admin)])
async def delete_delivery_option(
    cache: CacheDep,
    delivery_option_id: int,
) -> Message:
    """Delete a delivery option"""
    existing = await db.deliveryoption.find_unique(
        where={"id": delivery_option_id}
    )
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery option not found"
        )

    await db.deliveryoption.delete(
        where={"id": delivery_option_id}
    )

    await cache.invalidate("delivery")
    return Message(message="Delivery option deleted successfully")
