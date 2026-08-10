from __future__ import annotations

from collections.abc import Sequence

from typing import Any

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.db.models.base import Order, OrderItem


class OrderRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(
        self,
        id: int,
        *,
        include: dict | None = None,
    ) -> Order | None:
        stmt = select(Order).where(
            Order.id == id,
        )

        include = include or {}

        if include.get("order_items"):
            items_loader = selectinload(Order.order_items)

            if isinstance(include["order_items"], dict):
                nested = include["order_items"].get("include", {})

                if nested.get("variant"):
                    items_loader = items_loader.selectinload(
                        OrderItem.variant
                    )

            stmt = stmt.options(items_loader)

        if include.get("user"):
            stmt = stmt.options(
                selectinload(Order.user)
            )

        if include.get("payment"):
            stmt = stmt.options(
                selectinload(Order.payment)
            )

        if include.get("order_timeline"):
            stmt = stmt.options(
                selectinload(Order.order_timeline)
            )

        if include.get("shipping_address"):
            stmt = stmt.options(
                selectinload(Order.shipping_address)
            )

        if include.get("billing_address"):
            stmt = stmt.options(
                selectinload(Order.billing_address)
            )

        result = await self.session.execute(stmt)

        return result.scalar_one_or_none()

    async def get_by_order_number(
        self,
        order_number: str,
        *,
        include: dict | None = None,
    ) -> Order | None:
        stmt = select(Order).where(
            Order.order_number == order_number
        )

        include = include or {}

        if include.get("order_items"):
            items_loader = selectinload(Order.order_items)

            if isinstance(include["order_items"], dict):
                nested = include["order_items"].get("include", {})

                if nested.get("variant"):
                    items_loader = items_loader.selectinload(
                        OrderItem.variant
                    )

            stmt = stmt.options(items_loader)

        if include.get("user"):
            stmt = stmt.options(
                selectinload(Order.user)
            )

        if include.get("payment"):
            stmt = stmt.options(
                selectinload(Order.payment)
            )

        if include.get("order_timeline"):
            stmt = stmt.options(
                selectinload(Order.order_timeline)
            )

        if include.get("shipping_address"):
            stmt = stmt.options(
                selectinload(Order.shipping_address)
            )

        if include.get("billing_address"):
            stmt = stmt.options(
                selectinload(Order.billing_address)
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