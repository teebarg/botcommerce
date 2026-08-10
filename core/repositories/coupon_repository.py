from typing import Any
from datetime import datetime
from sqlalchemy import insert
from sqlalchemy.ext.asyncio import AsyncSession

from core.db.models import Coupon, User


class CouponRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create2(
        self,
        *,
        code: str,
        discount_type: str,
        discount_value: float,
        min_cart_value: float | None = None,
        max_uses: int = 1,
        valid_from: datetime | None = None,
        valid_until: datetime | None = None,
        user_id: int | None = None,
    ) -> Coupon:
        coupon = Coupon(
            code=code,
            discount_type=discount_type,
            discount_value=discount_value,
            min_cart_value=min_cart_value,
            max_uses=max_uses,
            valid_from=valid_from,
            valid_until=valid_until,
        )

        self.session.add(coupon)

        if user_id is not None:
            user = await self.session.get(User, user_id)

            if user is None:
                raise ValueError(f"User {user_id} not found")

            coupon.users.append(user)

        await self.session.flush()
        await self.session.refresh(coupon)

        return coupon

    async def create(self, *, data: dict[str, Any]) -> Coupon:
        data = data.copy()

        user_id = data.pop("user_id", None)

        coupon = Coupon(**data)

        if user_id is not None:
            user = await self.session.get(User, user_id)

            if user is None:
                raise ValueError(f"User {user_id} not found")

            coupon.users.append(user)

        self.session.add(coupon)

        await self.session.flush()
        await self.session.refresh(coupon)

        return coupon