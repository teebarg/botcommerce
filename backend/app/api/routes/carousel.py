from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from math import ceil

from app.core.deps import get_current_superuser
from app.models.carousel import (
    CarouselBanner,
    CarouselBannerCreate,
    CarouselBannerUpdate,
    CarouselBanners
)
from app.models.generic import Message
from app.prisma_client import prisma as db
from app.core.storage import upload, delete_image
from app.models.generic import ImageUpload

router = APIRouter()

@router.get("/")
async def list_banners(
    page: int = Query(default=1, gt=0),
    limit: int = Query(default=20, le=100),
    is_active: Optional[bool] = None
) -> CarouselBanners:
    """List all carousel banners with optional filtering"""
    where = {}
    if is_active is not None:
        where["is_active"] = is_active

    banners = await db.carouselbanner.find_many(
        where=where,
        skip=(page - 1) * limit,
        take=limit,
        order={"order": "asc", "created_at": "desc"}
    )
    total = await db.carouselbanner.count(where=where)
    
    return {
        "banners": banners,
        "page": page,
        "limit": limit,
        "total_pages": ceil(total/limit),
        "total_count": total
    }

@router.get("/active")
async def get_active_banners() -> list[CarouselBanner]:
    """Get all active carousel banners"""
    return await db.carouselbanner.find_many(
        where={"is_active": True},
        order={"order": "asc", "created_at": "desc"}
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

        # If there's a new image, delete the old one
        if banner.image and banner.image != existing_banner.image:
            await delete_image(existing_banner.image)

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