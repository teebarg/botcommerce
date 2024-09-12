from typing import Any, Dict

from sqlmodel import Session, select

from core.logging import logger
from crud.base import CRUDBase
from models.address import AddressCreate, AddressUpdate
from models.generic import Address


class CRUDAddress(CRUDBase[Address, AddressCreate, AddressUpdate]):
    def generate_statement(self, statement, query: dict) -> str:
        for key, value in query.items():
            if value and key == "name":
                statement = statement.where(Address.address.lower().like(f"%{value}%"))
            if value and key == "user_id":
                statement = statement.where(Address.user_id == value)
        return statement

    def get_multi(
        self,
        db: Session,
        query: dict,
        per_page: int,
        offset: int,
        sort: str = "desc",
    ) -> list[Address]:
        statement = select(self.model)
        statement = self.generate_statement(statement=statement, query=query)
        if sort == "desc":
            statement = statement.order_by(self.model.created_at.desc())
        return db.exec(statement.offset(offset).limit(per_page))

    def create(self, db: Session, obj_in: AddressCreate, user_id: int) -> Address:
        db_obj = Address.model_validate(
            obj_in,
            update={"user_id": user_id},
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: Address,
        obj_in: AddressUpdate,
    ) -> Address:
        update_data = obj_in.model_dump(exclude_unset=True)
        db_obj.sqlmodel_update(update_data)
        return self.sync(db=db, update=db_obj, type="update")

    async def bulk_upload(self, db: Session, *, records: list[Dict[str, Any]]) -> None:
        for address in records:
            try:
                if model := db.exec(
                    select(Address).where(Address.name == address.get("slug"))
                ).first():
                    model.sqlmodel_update(address)
                else:
                    model = Address(**address)
                    db.add(model)
                db.commit()
            except Exception as e:
                logger.error(e)


address = CRUDAddress(Address)
