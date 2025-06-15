from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.delivery import DeliveryOption, DeliveryOptionCreate, DeliveryOptionUpdate
from app.core.deps import get_current_superuser
from app.prisma_client import prisma as db
from app.models.generic import Message

router = APIRouter()

@router.get("/", response_model=List[DeliveryOption], dependencies=[Depends(get_current_superuser)])
async def get_delivery_options():
    """Get all delivery options"""
    return await db.deliveryoption.find_many()

@router.get("/available", response_model=List[DeliveryOption])
async def get_available_delivery_options():
    """Get all active delivery options"""
    return await db.deliveryoption.find_many(
        where={"is_active": True}
    )

@router.post("/", dependencies=[Depends(get_current_superuser)])
async def create_delivery_option(
    delivery_option: DeliveryOptionCreate,
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

    return await db.deliveryoption.create(data=delivery_option.model_dump())

@router.get("/{delivery_option_id}", dependencies=[Depends(get_current_superuser)])
async def get_delivery_option(
    delivery_option_id: int,
) -> DeliveryOption:
    """Get a specific delivery option"""
    delivery_option = await db.deliveryoption.find_unique(
        where={"id": delivery_option_id}
    )
    if not delivery_option:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery option not found"
        )
    return delivery_option

@router.patch("/{delivery_option_id}", dependencies=[Depends(get_current_superuser)])
async def update_delivery_option(
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

    return await db.deliveryoption.update(
        where={"id": delivery_option_id},
        data=delivery_option_update.model_dump(exclude_unset=True)
    )

@router.delete("/{delivery_option_id}", dependencies=[Depends(get_current_superuser)])
async def delete_delivery_option(
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

    return {"message": "Delivery option deleted successfully"}
