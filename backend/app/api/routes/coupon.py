from app.models.generic import Message
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Header
from app.core.deps import get_current_superuser, UserDep, CurrentUser
from app.models.coupon import (
    CouponCreate,
    CouponUpdate,
    Coupon,
    CouponValidateRequest,
    CouponValidateResponse,
    PaginatedCoupons, CouponScope, CouponAnalytics
)
from app.services.coupon import CouponService
from app.prisma_client import prisma as db
from app.core.logging import get_logger
from app.services.redis import cache_response, invalidate_pattern
from prisma.errors import PrismaError
from datetime import datetime, date

logger = get_logger(__name__)
router = APIRouter()


@router.get("/", dependencies=[Depends(get_current_superuser)])
@cache_response(key_prefix="coupons")
async def get_coupons(
    request: Request,
    query: Optional[str] = Query(""),
    is_active: Optional[bool] = None,
    cursor: int | None = None,
    limit: int = Query(default=20, le=100)
) -> PaginatedCoupons:
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
        skip=1 if cursor else 0,
        take=limit + 1,
        cursor={"id": cursor} if cursor else None,
        order={"created_at": "desc"},
        include={"users": True, "usages": True}
    )
    items = coupons[:limit]

    return {
        "items": items,
        "next_cursor": items[-1].id if len(coupons) > limit else None,
        "limit": limit
    }


@router.post("/", dependencies=[Depends(get_current_superuser)])
async def create_coupon(coupon_data: CouponCreate) -> Coupon:
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


@router.patch("/{id}", dependencies=[Depends(get_current_superuser)])
async def update_coupon(id: int, coupon_data: CouponUpdate) -> Coupon:
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


@router.post("/validate")
async def validate_coupon(
    request: CouponValidateRequest,
    user: UserDep = None,
    cartId: Optional[str] = None
) -> CouponValidateResponse:
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


@router.post("/apply")
async def apply_coupon(
    code: str = Query(..., description="Coupon code to apply"),
    user: CurrentUser = None,
    cartId: Optional[str] = Header(default=None)
) -> Message:
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

    return Message(message="Coupon applied successfully")


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
async def assign_coupon(id: int, user_ids: List[int]):
    """
    Share a coupon with specific users (Admin only).

    """
    coupon = await db.coupon.find_unique(where={"id": id})
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    try:
        update_data = {"users": {"set": [{"id": id} for id in user_ids]}}
        if coupon.scope != CouponScope.SPECIFIC_USERS:
            update_data["scope"] = CouponScope.SPECIFIC_USERS
        await db.coupon.update(where={"id": id}, data=update_data)

        await invalidate_pattern("coupons")
        return {"message": f"Coupon shared with {len(user_ids)} user(s) successfully"}
    except PrismaError as e:
        logger.error(f"Error sharing coupon: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.patch("/{id}/toggle-status", dependencies=[Depends(get_current_superuser)])
async def toggle_coupon_status(id: int) -> Coupon:
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


@router.get("/analytics")
async def get_coupon_analytics(
    start_date: Optional[date] = Query(None, description="Filter coupons created from this date"),
    end_date: Optional[date] = Query(None, description="Filter coupons created until this date")
) -> CouponAnalytics:
    """
    Get comprehensive coupon analytics with optional date range filtering.
    """
    
    date_filter = {}
    if start_date or end_date:
        date_filter["created_at"] = {}
        if start_date:
            date_filter["created_at"]["gte"] = datetime.combine(start_date, datetime.min.time())
        if end_date:
            date_filter["created_at"]["lte"] = datetime.combine(end_date, datetime.max.time())
    
    total_coupons = await db.coupon.count(
        where=date_filter if date_filter else None
    )
    
    used_filter = {
        "current_uses": {"gt": 0}
    }
    if date_filter:
        used_filter.update(date_filter)
    used_filter = {
        "current_uses": {"gt": 0}
    }
    if date_filter:
        used_filter.update(date_filter)
    
    used_coupons = await db.coupon.count(
        where=used_filter
    )
    
    coupons_with_uses = await db.coupon.find_many(
        where=date_filter if date_filter else None,
    )
    total_redemptions = sum(coupon.current_uses for coupon in coupons_with_uses)
    
    now = datetime.utcnow()
    
    active_filter = {
        "is_active": True,
        "OR": [
            {"valid_from": None},
            {"valid_from": {"lte": now}}
        ],
        "AND": [
            {
                "OR": [
                    {"valid_until": None},
                    {"valid_until": {"gte": now}}
                ]
            }
        ]
    }
    
    if date_filter:
        active_filter.update(date_filter)
    
    active_coupons_data = await db.coupon.find_many(where=active_filter)    
    active_coupons = sum(
        1 for coupon in active_coupons_data 
        if coupon.max_uses == 0 or coupon.current_uses < coupon.max_uses
    )
    
    avg_redemption_rate = (used_coupons / total_coupons * 100) if total_coupons > 0 else 0.0
    
    return CouponAnalytics(
        total_coupons=total_coupons,
        used_coupons=used_coupons,
        total_redemptions=total_redemptions,
        active_coupons=active_coupons,
        avg_redemption_rate=round(avg_redemption_rate, 2),
        date_range={
            "start_date": start_date.isoformat() if start_date else None,
            "end_date": end_date.isoformat() if end_date else None
        }
    )

@router.get("/detailed")
async def get_detailed_coupon_analytics(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None)
):
    """
    Get detailed coupon analytics including breakdown by discount type, scope, etc.
    """
    date_filter = {}
    if start_date or end_date:
        date_filter["created_at"] = {}
        if start_date:
            date_filter["created_at"]["gte"] = datetime.combine(start_date, datetime.min.time())
        if end_date:
            date_filter["created_at"]["lte"] = datetime.combine(end_date, datetime.max.time())
    
    coupons = await db.coupon.find_many(
        where=date_filter if date_filter else None,
    )
    
    # By type
    by_type = {}
    for coupon in coupons:
        discount_type = coupon.discount_type
        by_type[discount_type] = by_type.get(discount_type, 0) + 1
    
    # By scope
    by_scope = {}
    for coupon in coupons:
        scope = coupon.scope
        by_scope[scope] = by_scope.get(scope, 0) + 1
    
    # Top performing coupons
    top_coupons = sorted(coupons, key=lambda x: x.current_uses, reverse=True)[:10]
    top_coupons_data = [
        {
            "code": coupon.code,
            "redemptions": coupon.current_uses,
            "discount_type": coupon.discount_type,
            "discount_value": coupon.discount_value
        }
        for coupon in top_coupons
    ]
    
    return {
        "breakdown_by_discount_type": by_type,
        "breakdown_by_scope": by_scope,
        "top_performing_coupons": top_coupons_data,
        "date_range": {
            "start_date": start_date.isoformat() if start_date else None,
            "end_date": end_date.isoformat() if end_date else None
        }
    }
