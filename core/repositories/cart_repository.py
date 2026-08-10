from typing import Any

from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from core.db.models.base import Cart
from core.repositories.base_repository import BaseRepository


class CartRepository(BaseRepository[Cart]):
    model = Cart
