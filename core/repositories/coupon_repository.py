from typing import Any
from datetime import datetime
from sqlalchemy import insert
from sqlalchemy.ext.asyncio import AsyncSession

from core.db.models.base import Coupon, User


class CouponRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

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