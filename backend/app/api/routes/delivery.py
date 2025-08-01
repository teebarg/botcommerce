from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import List
from app.models.delivery import DeliveryOption, DeliveryOptionCreate, DeliveryOptionUpdate
from app.core.deps import get_current_superuser, RedisClient
from app.prisma_client import prisma as db
from app.models.generic import Message
from app.services.redis import cache_response

router = APIRouter()

@router.get("/", response_model=List[DeliveryOption], dependencies=[Depends(get_current_superuser)])
@cache_response("delivery")
async def get_delivery_options(request: Request):
    """Get all delivery options"""
    return await db.deliveryoption.find_many(order={"created_at": "desc"})

@router.get("/available", response_model=List[DeliveryOption])
@cache_response("delivery")
async def get_available_delivery_options(request: Request):
    """Get all active delivery options"""
    return await db.deliveryoption.find_many(
        where={"is_active": True},
        order={"created_at": "desc"}
    )

@router.post("/", dependencies=[Depends(get_current_superuser)])
async def create_delivery_option(
    delivery_option: DeliveryOptionCreate, redis: RedisClient
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

    await redis.bust_tag("delivery")

    return await db.deliveryoption.create(data=delivery_option.model_dump())

@router.patch("/{delivery_option_id}", dependencies=[Depends(get_current_superuser)])
async def update_delivery_option(
    delivery_option_id: int,
    delivery_option_update: DeliveryOptionUpdate,
    redis: RedisClient
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
        await redis.bust_tag("delivery")
        return res
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{delivery_option_id}", dependencies=[Depends(get_current_superuser)])
async def delete_delivery_option(
    delivery_option_id: int,
    redis: RedisClient
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

    await redis.bust_tag("delivery")

    return {"message": "Delivery option deleted successfully"}
