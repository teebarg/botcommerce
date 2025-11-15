from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Header
from app.core.deps import get_current_superuser, UserDep, CurrentUser
from app.models.coupon import (
    CouponCreate,
    CouponUpdate,
    CouponResponse,
    CouponValidateRequest,
    CouponValidateResponse,
    CouponsList,
)
from app.services.coupon import CouponService
from app.prisma_client import prisma as db

from app.core.logging import get_logger
from app.services.redis import cache_response, invalidate_pattern
from prisma.errors import PrismaError
from app.models.coupon import CouponScope

logger = get_logger(__name__)
router = APIRouter()


@router.get("/", dependencies=[Depends(get_current_superuser)])
@cache_response(key_prefix="coupons")
async def get_coupons(
    request: Request,
    query: Optional[str] = Query(""),
    is_active: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Get all coupons with pagination for admin.
    """
    where_clause = {}

    if query:
        where_clause["code"] = {"contains": query, "mode": "insensitive"}

    if is_active is not None:
        where_clause["is_active"] = is_active

    coupons = await db.coupon.find_many(
        where=where_clause,
        skip=skip,
        take=limit,
        order={"created_at": "desc"},
        include={"users": True}
    )

    total_count = await db.coupon.count(where=where_clause)

    return CouponsList(
        coupons=coupons,
        skip=skip,
        limit=limit,
        total_count=total_count,
        total_pages=(total_count + limit - 1) // limit
    )


@router.get("/{id}", response_model=CouponResponse)
async def get_coupon(id: int):
    """
    Get a coupon by ID.
    """
    coupon = await db.coupon.find_unique(where={"id": id})
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return coupon


@router.post("/", dependencies=[Depends(get_current_superuser)], response_model=CouponResponse)
async def create_coupon(coupon_data: CouponCreate):
    """
    Create a new coupon (Admin only).
    """
    code = coupon_data.code.upper()

    existing = await db.coupon.find_unique(where={"code": code})
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")

    try:
        data = coupon_data.model_dump(exclude={})
        data["code"] = code
        coupon = await db.coupon.create(data=data)

        await invalidate_pattern("coupons")
        return coupon
    except PrismaError as e:
        logger.error(f"Error creating coupon: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.patch("/{id}", dependencies=[Depends(get_current_superuser)], response_model=CouponResponse)
async def update_coupon(id: int, coupon_data: CouponUpdate):
    """
    Update a coupon (Admin only).
    """
    coupon = await db.coupon.find_unique(where={"id": id})
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    try:
        data = coupon_data.model_dump(exclude_unset=True)

        if "code" in data:
            data["code"] = data["code"].upper()
            existing = await db.coupon.find_first(
                where={"code": data["code"], "id": {"not": id}}
            )
            if existing:
                raise HTTPException(status_code=400, detail="Coupon code already exists")

        updated_coupon = await db.coupon.update(
            where={"id": id},
            data=data
        )

        await invalidate_pattern("coupons")
        return updated_coupon
    except HTTPException:
        raise
    except PrismaError as e:
        logger.error(f"Error updating coupon: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.delete("/{id}", dependencies=[Depends(get_current_superuser)])
async def delete_coupon(id: int):
    """
    Delete a coupon.
    """
    coupon = await db.coupon.find_unique(where={"id": id})
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    try:
        await db.coupon.delete(where={"id": id})
        await invalidate_pattern("coupons")
        return {"message": "Coupon deleted successfully"}
    except PrismaError as e:
        logger.error(f"Error deleting coupon: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/validate", response_model=CouponValidateResponse)
async def validate_coupon(
    request: CouponValidateRequest,
    user: UserDep = None,
    cartId: Optional[str] = None
):
    """
    Validate a coupon code for a cart.
    """
    service = CouponService()
    cart = None
    if cartId:
        cart = await db.cart.find_unique(where={"cart_number": cartId})
    elif request.cart_id:
        cart = await db.cart.find_unique(where={"id": request.cart_id})
    elif user:
        cart = await db.cart.find_first(
            where={"user_id": user.id, "status": "ACTIVE"},
            order={"updated_at": "desc"}
        )

    try:
        coupon = await service.validate_coupon(
            code=request.code,
            cart=cart,
            user_id=user.id if user else None
        )

        if cart:
            discount_amount = await service.calculate_discount(coupon, cart.subtotal)
        else:
            discount_amount = None

        return CouponValidateResponse(
            valid=True,
            coupon=coupon,
            discount_amount=discount_amount,
            message="Coupon is valid"
        )
    except HTTPException as e:
        return CouponValidateResponse(
            valid=False,
            message=str(e.detail)
        )
    except Exception as e:
        logger.error(f"Error validating coupon: {str(e)}")
        return CouponValidateResponse(
            valid=False,
            message="An error occurred while validating the coupon"
        )


@router.post("/apply", response_model=CouponResponse)
async def apply_coupon(
    code: str = Query(..., description="Coupon code to apply"),
    user: CurrentUser = None,
    cartId: Optional[str] = Header(default=None)
):
    """
    Apply a coupon to a cart.
    """
    service = CouponService()
    cart = None
    if cartId:
        cart = await db.cart.find_unique(where={"cart_number": cartId})
    elif user:
        cart = await db.cart.find_first(
            where={"user_id": user.id, "status": "ACTIVE"},
            order={"updated_at": "desc"}
        )

    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    coupon = await service.validate_coupon(
        code=code,
        cart=cart,
        user_id=user.id if user else None
    )

    await service.apply_coupon_to_cart(coupon, cart)

    from app.services.redis import invalidate_pattern
    await invalidate_pattern("abandoned-carts")
    await invalidate_pattern("cart")
    await invalidate_pattern("coupons")

    return coupon


@router.post("/remove", response_model=dict)
async def remove_coupon(
    user: UserDep = None,
    cartId: Optional[str] = None
):
    """
    Remove coupon from cart.
    """
    service = CouponService()
    cart = None
    if cartId:
        cart = await db.cart.find_unique(where={"cart_number": cartId})
    elif user:
        cart = await db.cart.find_first(
            where={"user_id": user.id, "status": "ACTIVE"},
            order={"updated_at": "desc"}
        )

    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    if not cart.coupon_id:
        raise HTTPException(status_code=400, detail="No coupon applied to this cart")

    await service.remove_coupon_from_cart(cart)

    from app.services.redis import invalidate_pattern
    await invalidate_pattern("abandoned-carts")
    await invalidate_pattern("cart")
    await invalidate_pattern("coupons")

    return {"message": "Coupon removed successfully"}


@router.post("/{id}/assign", dependencies=[Depends(get_current_superuser)])
async def share_coupon(id: int, user_ids: List[int]):
    """
    Share a coupon with specific users (Admin only).
    """
    coupon = await db.coupon.find_unique(where={"id": id})
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    try:
        if coupon.scope != CouponScope.SPECIFIC_USERS:
            update_data["users"] = {"set": [{"id": id} for id in user_ids]}
            update_data["scope"] = CouponScope.SPECIFIC_USERS
            await db.coupon.update(where={"id": id}, data=update_data)

        await invalidate_pattern("coupons")
        return {"message": f"Coupon shared with {len(user_ids)} user(s) successfully"}
    except PrismaError as e:
        logger.error(f"Error sharing coupon: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.patch("/{id}/toggle-status", dependencies=[Depends(get_current_superuser)], response_model=CouponResponse)
async def toggle_coupon_status(id: int):
    """
    Toggle coupon active status (Admin only).
    """
    coupon = await db.coupon.find_unique(where={"id": id})
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    try:
        updated_coupon = await db.coupon.update(
            where={"id": id},
            data={"is_active": not coupon.is_active}
        )

        await invalidate_pattern("coupons")
        return updated_coupon
    except PrismaError as e:
        logger.error(f"Error toggling coupon status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
