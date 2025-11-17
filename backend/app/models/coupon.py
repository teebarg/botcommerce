from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from prisma.enums import DiscountType
from enum import Enum
from prisma.models import CouponUsage

class CouponScope(str, Enum):
    GENERAL = "GENERAL"
    SPECIFIC_USERS = "SPECIFIC_USERS"

class User(BaseModel):
    id: int
    email: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class CouponBase(BaseModel):
    code: str = Field(..., min_length=3, max_length=20, description="Coupon code")
    discount_type: DiscountType
    discount_value: float = Field(..., gt=0, description="Discount value")
    min_cart_value: Optional[float] = Field(None, ge=0, description="Minimum cart value required")
    min_item_quantity: Optional[int] = Field(None, ge=0, description="Minimum item quantity required")
    valid_from: datetime
    valid_until: datetime
    max_uses: int = Field(1, ge=1, description="Maximum number of times coupon can be used")
    max_uses_per_user: int = Field(1, ge=1, description="Maximum number of times coupon can be used per user")
    scope: CouponScope = CouponScope.GENERAL
    is_active: bool = True


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
    max_uses_per_user: Optional[int] = Field(None, ge=1)
    scope: Optional[CouponScope] = None
    is_active: Optional[bool] = None


class CouponResponse(CouponBase):
    id: int
    usages: Optional[List[CouponUsage]] = None
    users: Optional[List[User]] = None
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
