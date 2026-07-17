from typing import List
from prisma.errors import PrismaError
from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from app.models.delivery import DeliveryOption, DeliveryOptionCreate, DeliveryOptionUpdate
from app.prisma_client import prisma as db
from app.models.generic import Message
from app.core.permissions import require_admin
from app.core.dependencies.services import DeliveryDep
from app.services.cache import cacheable

router = APIRouter()

@router.get("/", response_model=List[DeliveryOption])
@cacheable(key_prefix="delivery", key_builder=False, expire=259200000, cdn_ttl=31536000, cdn_swr=604800)
async def index(request: Request):
    """Get all delivery options"""
    return await db.deliveryoption.find_many(order={"created_at": "desc"})

@router.post("/", dependencies=[Depends(require_admin)])
async def create(
    delivery_option: DeliveryOptionCreate,
    srv: DeliveryDep, bg_tasks: BackgroundTasks
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
    bg_tasks.add_task(srv.invalidate)
    return await db.deliveryoption.create(data=delivery_option.model_dump())

@router.patch("/{id}", dependencies=[Depends(require_admin)])
async def update(
    srv: DeliveryDep,
    id: int,
    delivery_update: DeliveryOptionUpdate,
    bg_tasks: BackgroundTasks
) -> DeliveryOption:
    """Update a delivery option"""
    existing = await db.deliveryoption.find_unique(where={"id": id})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery option not found"
        )

    try:
        res = await db.deliveryoption.update(
            where={"id": id},
            data=delivery_update.model_dump(exclude_unset=True)
        )
        bg_tasks.add_task(srv.invalidate)
        return res
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{id}", dependencies=[Depends(require_admin)])
async def delete(srv: DeliveryDep, id: int, bg_tasks: BackgroundTasks) -> Message:
    """Delete a delivery option"""
    existing = await db.deliveryoption.find_unique(where={"id": id})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Delivery option not found"
        )

    await db.deliveryoption.delete(where={"id": id})
    bg_tasks.add_task(srv.invalidate)
    return Message(message="Delivery option deleted successfully")
