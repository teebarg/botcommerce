from __future__ import annotations

from collections.abc import Sequence

from typing import Any

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.repositories.base_repository import BaseRepository
from core.db.models import User, WalletTransaction


class WalletTransactionRepository(BaseRepository[WalletTransaction]):
    model = WalletTransaction

    async def find_existing_cashback(self, order_number: str) -> WalletTransaction | None:
        return await self.get_one(reference_id=order_number, type="CASHBACK")
