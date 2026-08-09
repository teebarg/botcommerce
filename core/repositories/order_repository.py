from __future__ import annotations

from collections.abc import Sequence

from typing import Any

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.db.models.order_model import Order


class OrderRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(
        self,
        order_id: int,
        *,
        include_items: bool = False,
        include_user: bool = False,
        include_payment: bool = False,
        include_timeline: bool = False,
    ) -> Order | None:
        stmt = select(Order).where(
            Order.id == order_id,
        )

        if include_items:
            stmt = stmt.options(
                selectinload(Order.order_items),
            )

        if include_user:
            stmt = stmt.options(
                selectinload(Order.user),
            )

        if include_payment:
            stmt = stmt.options(
                selectinload(Order.payment),
            )

        if include_timeline:
            stmt = stmt.options(
                selectinload(Order.order_timeline),
            )

        result = await self.session.execute(stmt)

        return result.scalar_one_or_none()

    async def get_by_order_number(
        self,
        order_number: str,
        *,
        include_items: bool = False,
        include_user: bool = False,
        include_payment: bool = False,
        include_timeline: bool = False,
    ) -> Order | None:
        stmt = select(Order).where(
            Order.order_number == order_number,
        )

        if include_items:
            stmt = stmt.options(
                selectinload(Order.order_items),
            )

        if include_user:
            stmt = stmt.options(
                selectinload(Order.user),
            )

        if include_payment:
            stmt = stmt.options(
                selectinload(Order.payment),
            )

        if include_timeline:
            stmt = stmt.options(
                selectinload(Order.order_timeline),
            )

        result = await self.session.execute(stmt)

        return result.scalar_one_or_none()

    async def list_by_user(
        self,
        user_id: int,
        *,
        status: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Sequence[Order]:
        stmt = (
            select(Order)
            .where(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
            .limit(limit)
            .offset(offset)
        )

        if status is not None:
            stmt = stmt.where(
                Order.status == status,
            )

        result = await self.session.execute(stmt)

        return result.scalars().all()

    async def list_by_status(
        self,
        status: str,
        *,
        limit: int = 50,
        offset: int = 0,
    ) -> Sequence[Order]:
        stmt = (
            select(Order)
            .where(Order.status == status)
            .order_by(Order.created_at.desc())
            .limit(limit)
            .offset(offset)
        )

        result = await self.session.execute(stmt)

        return result.scalars().all()

    async def update(
        self,
        order_id: int,
        *,
        data: dict,
    ) -> Order | None:
        order = await self.get_by_id(order_id)

        if order is None:
            return None

        for field, value in data.items():
            if not hasattr(order, field):
                raise ValueError(
                    f"Invalid Order field: {field}"
                )

            setattr(order, field, value)

        await self.session.flush()

        return order