from __future__ import annotations

from core.repositories.base_repository import BaseRepository
from core.db.models import User


class UserRepository(BaseRepository[User]):
    model = User

    async def find_by_referral_code(self, code: str) -> User | None:
        return await self.get_one(referral_code=code)

    async def increment_wallet_balance(self, user_id: int, amount: float) -> User | None:
        return await self.update(
            user_id,
            {"wallet_balance": User.wallet_balance + amount},
        )