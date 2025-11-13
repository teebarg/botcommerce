from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from prisma.enums import DiscountType, CouponScope


class CouponBase(BaseModel):
    code: str = Field(..., min_length=3, max_length=20, description="Coupon code")
    discount_type: DiscountType
    discount_value: float = Field(..., gt=0, description="Discount value")
    min_cart_value: Optional[float] = Field(None, ge=0, description="Minimum cart value required")
    min_item_quantity: Optional[int] = Field(None, ge=0, description="Minimum item quantity required")
    valid_from: datetime
    valid_until: datetime
    max_uses: int = Field(1, ge=1, description="Maximum number of times coupon can be used")
    scope: CouponScope = CouponScope.GENERAL
    is_active: bool = True
    assigned_users: Optional[List[int]] = Field(None, description="List of user IDs for specific_users scope")


class CouponCreate(CouponBase):
    pass


class CouponUpdate(BaseModel):
    code: Optional[str] = Field(None, min_length=3, max_length=20)
    discount_type: Optional[DiscountType] = None
    discount_value: Optional[float] = Field(None, gt=0)
    min_cart_value: Optional[float] = Field(None, ge=0)
    min_item_quantity: Optional[int] = Field(None, ge=0)
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    max_uses: Optional[int] = Field(None, ge=1)
    scope: Optional[CouponScope] = None
    is_active: Optional[bool] = None
    assigned_users: Optional[List[int]] = None


class CouponResponse(CouponBase):
    id: int
    current_uses: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CouponValidateRequest(BaseModel):
    code: str
    cart_id: Optional[int] = None
    cart_number: Optional[str] = None


class CouponValidateResponse(BaseModel):
    valid: bool
    coupon: Optional[CouponResponse] = None
    discount_amount: Optional[float] = None
    message: Optional[str] = None


class CouponsList(BaseModel):
    coupons: List[CouponResponse]
    skip: int
    limit: int
    total_count: int
    total_pages: int

