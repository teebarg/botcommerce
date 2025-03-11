from sqlalchemy.orm import Session
from sqlmodel import select

from app.core.cruds.base import BaseCRUD
from app.models.address import AddressCreate, AddressUpdate
from app.models.address import Address


class AddressCRUD(BaseCRUD[Address, AddressCreate, AddressUpdate]):
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
        limit: int,
        offset: int,
        sort: str = "desc",
    ) -> list[Address]:
        statement = select(self.model)
        statement = self.generate_statement(statement=statement, query=query)
        if sort == "desc":
            statement = statement.order_by(self.model.created_at.desc())
        return db.exec(statement.offset(offset).limit(limit))

    def create(self, db: Session, obj_in: AddressCreate, user_id: int) -> Address:
        db_obj = Address.model_validate(
            obj_in,
            update={"user_id": user_id},
        )
        return self.sync(db=db, update=db_obj)
