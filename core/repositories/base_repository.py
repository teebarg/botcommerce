from __future__ import annotations

from typing import Any, Generic, Sequence, TypeVar

from sqlalchemy import delete as sa_delete
from sqlalchemy import func, select
from sqlalchemy import update as sa_update
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm.strategy_options import _AbstractLoad

ModelT = TypeVar("ModelT", bound=DeclarativeBase)


class BaseRepository(Generic[ModelT]):
    """
    Generic repository for common CRUD + upsert operations.

    Subclass and set `model`, or instantiate directly:
        CartRepository = BaseRepository[Cart]
    """

    model: type[ModelT]

    def __init__(self, session: AsyncSession, model: type[ModelT] | None = None):
        self.session = session
        if model is not None:
            self.model = model

    # ---- reads ----

    # async def get_by_id(self, id: Any) -> ModelT | None:
    #     return await self.session.get(self.model, id)

    async def get_by_id(
        self,
        id: Any,
        *,
        options: Sequence[_AbstractLoad] | None = None,
    ) -> ModelT | None:
        stmt = select(self.model).where(self.model.id == id)
        if options:
            stmt = stmt.options(*options)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_one(self, **filters: Any) -> ModelT | None:
        stmt = select(self.model).filter_by(**filters)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list(
        self,
        *,
        limit: int | None = None,
        offset: int | None = None,
        order_by: Any = None,
        **filters: Any,
    ) -> Sequence[ModelT]:
        stmt = select(self.model).filter_by(**filters)
        if order_by is not None:
            stmt = stmt.order_by(order_by)
        if limit is not None:
            stmt = stmt.limit(limit)
        if offset is not None:
            stmt = stmt.offset(offset)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def count(self, **filters: Any) -> int:
        stmt = select(func.count()).select_from(
            self.model).filter_by(**filters)
        result = await self.session.execute(stmt)
        return result.scalar_one()

    async def exists(self, **filters: Any) -> bool:
        return await self.count(**filters) > 0

    # ---- writes ----

    async def create(self, data: dict[str, Any]) -> ModelT:
        obj = self.model(**data)
        self.session.add(obj)
        await self.session.flush()  # populate PK/defaults without ending the tx
        return obj

    async def update(self, id: Any, data: dict[str, Any]) -> ModelT | None:
        if not data:
            return await self.get_by_id(id)

        stmt = (
            sa_update(self.model)
            # assumes `id` PK; override if composite
            .where(self.model.id == id)
            .values(**data)
            .returning(self.model)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def delete(self, id: Any) -> bool:
        stmt = sa_delete(self.model).where(self.model.id == id)
        result = await self.session.execute(stmt)
        return result.rowcount > 0

    async def upsert(
        self,
        *,
        create: dict[str, Any],
        update: dict[str, Any],
        conflict_columns: list[str],
    ) -> ModelT | None:
        """
        Mirrors Laravel/Prisma-style upsert:
            create -> row to insert if no conflict
            update -> columns to set if conflict found (pass {} for do-nothing)
            conflict_columns -> columns backing the unique constraint/index to target

        NOTE: conflict_columns must match a real unique constraint or PK on the
        table, or Postgres has nothing to target with ON CONFLICT.
        """
        stmt = pg_insert(self.model).values(**create)

        if update:
            stmt = stmt.on_conflict_do_update(
                index_elements=conflict_columns,
                set_=update,
            )
        else:
            stmt = stmt.on_conflict_do_nothing(
                index_elements=conflict_columns,
            )

        stmt = stmt.returning(self.model)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def bulk_create(self, rows: list[dict[str, Any]]) -> Sequence[ModelT]:
        stmt = pg_insert(self.model).values(rows).returning(self.model)
        result = await self.session.execute(stmt)
        return result.scalars().all()
