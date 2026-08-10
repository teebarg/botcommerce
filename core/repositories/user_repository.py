from __future__ import annotations

from collections.abc import Sequence

from typing import Any

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.db.models import User


class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get(
        self,
        id: int,
    ) -> User | None:
        stmt = select(User).where(
            User.id == id,
        )

        result = await self.session.execute(stmt)

        return result.scalar_one_or_none()

    async def update(
        self,
        id: int,
        data: dict[str, Any],
    ) -> User | None:
        stmt = (
            update(User)
            .where(User.id == id)
            .values(**data)
            .returning(User)
        )

        result = await self.session.execute(stmt)

        return result.scalar_one_or_none()