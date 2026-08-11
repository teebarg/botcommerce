from __future__ import annotations

from collections.abc import Sequence

from typing import Any

from sqlalchemy import select, update

from core.repositories.base_repository import BaseRepository
from core.db.models import User


class UserRepository(BaseRepository[User]):
    model = User

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

    async def find_by_referral_code(self, code: str) -> User | None:
        return await self.get_one(referral_code=code)

    async def increment_wallet_balance(self, user_id: int, amount: float) -> User | None:
        return await self.update(
            user_id,
            {"wallet_balance": User.wallet_balance + amount},
        )