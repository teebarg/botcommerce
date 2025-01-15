from app.core.cruds.base import BaseCRUD
from sqlmodel import Session

from app.core.utils import generate_slug
from app.models.brand import AddressCreate, AddressUpdate
from app.models.generic import Address


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

    async def bulk_upload(self, db: Session, *, records: list[dict[str, Any]]) -> None:
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

    def create(self, db: Session, obj_in: AddressCreate) -> Address:
        db_obj = Address.model_validate(
            obj_in,
            update={"slug": generate_slug(name=obj_in.name)},
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
