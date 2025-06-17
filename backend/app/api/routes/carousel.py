from fastapi import APIRouter, Depends, HTTPException
from typing import Optional

from app.core.deps import get_current_superuser
from app.models.carousel import (
    CarouselBanner,
    CarouselBannerCreate,
    CarouselBannerUpdate,
)
from app.models.generic import Message
from app.prisma_client import prisma as db
from app.core.storage import upload, delete_Image
from app.models.generic import ImageUpload

router = APIRouter()

@router.get("/")
async def list_banners(
    is_active: Optional[bool] = None
) -> list[CarouselBanner]:
    """List all carousel banners with optional filtering"""
    where = {}
    if is_active is not None:
        where["is_active"] = is_active

    banners = await db.carouselbanner.find_many(
        where=where,
        order={"order": "asc"}
    )

    return banners

@router.get("/active")
async def get_active_banners() -> list[CarouselBanner]:
    """Get all active carousel banners"""
    return await db.carouselbanner.find_many(
        where={"is_active": True},
        order={"order": "asc"}
    )

@router.get("/{id}")
async def get_banner(id: int) -> CarouselBanner:
    """Get a specific carousel banner by ID"""
    banner = await db.carouselbanner.find_unique(where={"id": id})
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    return banner

@router.post("/", dependencies=[Depends(get_current_superuser)])
async def create_banner(banner: CarouselBannerCreate) -> CarouselBanner:
    """Create a new carousel banner"""
    try:
        return await db.carouselbanner.create(data=banner.model_dump())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{id}", dependencies=[Depends(get_current_superuser)])
async def update_banner(id: int, banner: CarouselBannerUpdate) -> CarouselBanner:
    """Update a carousel banner"""
    try:
        existing_banner = await db.carouselbanner.find_unique(where={"id": id})
        if not existing_banner:
            raise HTTPException(status_code=404, detail="Banner not found")

        return await db.carouselbanner.update(
            where={"id": id},
            data=banner.model_dump(exclude_unset=True)
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{id}", dependencies=[Depends(get_current_superuser)])
async def delete_banner(id: int) -> Message:
    """Delete a carousel banner"""
    try:
        banner = await db.carouselbanner.find_unique(where={"id": id})
        if not banner:
            raise HTTPException(status_code=404, detail="Banner not found")

        # Delete the banner image
        await delete_image(banner.image)

        await db.carouselbanner.delete(where={"id": id})
        return {"message": "Banner deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{id}/image")
async def add_image(id: int, image_data: ImageUpload) -> CarouselBanner:
    """
    Add an image to a banner.
    """
    banner = await db.carouselbanner.find_unique(
        where={"id": id}
    )
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")

    try:
        image_url = upload(bucket="images", data=image_data)

        # Update banner with new image URL
        updated_banner = await db.carouselbanner.update(
            where={"id": id},
            data={"image": image_url}
        )
        return updated_banner

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload image: {str(e)}"
        )