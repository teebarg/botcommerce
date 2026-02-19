from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from prisma.enums import DiscountType, CouponScope
from app.models.user import User

class CouponUsage(BaseModel):
    id: int
    coupon_id: int
    user_id: int
    name: str
    email: str
    discount_amount: float
    created_at: datetime


class CouponBase(BaseModel):
    id: int
    code: str
    discount_type: DiscountType
    discount_value: float
    min_cart_value: Optional[float]
    min_item_quantity: Optional[int]
    valid_from: Optional[datetime]
    valid_until: Optional[datetime]
    max_uses: int
    max_uses_per_user: int
    current_uses: int
    scope: CouponScope
    is_active: bool

class Coupon(CouponBase):
    usages: Optional[List[CouponUsage]] = None
    users: Optional[List[User]] = None

class CouponCreate(BaseModel):
    code: str = Field(..., min_length=3, max_length=20, description="Coupon code")
    discount_type: DiscountType
    discount_value: float = Field(..., gt=0, description="Discount value")
    min_cart_value: Optional[float] = Field(None, ge=0, description="Minimum cart value required")
    min_item_quantity: Optional[int] = Field(None, ge=0, description="Minimum item quantity required")
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    max_uses: int = Field(1, ge=1, description="Maximum number of times coupon can be used")
    max_uses_per_user: int = Field(1, ge=1, description="Maximum number of times coupon can be used per user")
    scope: Optional[CouponScope] = CouponScope.GENERAL
    is_active: bool = True


class CouponUpdate(BaseModel):
    code: Optional[str] = Field(None, min_length=3, max_length=20)
    discount_type: Optional[DiscountType] = None
    discount_value: Optional[float] = Field(None, gt=0)
    min_cart_value: Optional[float] = Field(None, ge=0)
    min_item_quantity: Optional[int] = Field(None, ge=0)
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    max_uses: Optional[int] = Field(None, ge=1)
    max_uses_per_user: Optional[int] = Field(None, ge=1)
    scope: Optional[CouponScope] = None
    is_active: Optional[bool] = None


class CouponValidateRequest(BaseModel):
    code: str
    cart_id: Optional[int] = None
    cart_number: Optional[str] = None


class CouponValidateResponse(BaseModel):
    valid: bool
    coupon: Optional[Coupon] = None
    discount_amount: Optional[float] = None
    message: Optional[str] = None


class PaginatedCoupons(BaseModel):
    items: List[Coupon]
    next_cursor: int | None
    limit: int

class CouponAnalytics(BaseModel):
    total_coupons: int
    used_coupons: int
    total_redemptions: int
    active_coupons: int
    avg_redemption_rate: float
    date_range: dict
