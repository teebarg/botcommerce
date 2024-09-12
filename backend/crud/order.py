from sqlmodel import Session, select

from crud.base import CRUDBase
from models.generic import Order
from models.order import OrderCreate, OrderUpdate


class CRUDOrder(CRUDBase[Order, OrderCreate, OrderUpdate]):
    def generate_statement(self, statement, query: dict) -> str:
        for key, value in query.items():
            if value and key == "order_number":
                statement = statement.where(Order.order_number == value)
            if value and key == "user_id":
                statement = statement.where(Order.user_id == value)
        return statement

    def get_multi(
        self,
        db: Session,
        query: dict,
        per_page: int,
        offset: int,
        sort: str = "desc",
    ) -> list[Order]:
        statement = select(self.model)
        statement = self.generate_statement(statement=statement, query=query)
        if sort == "desc":
            statement = statement.order_by(self.model.created_at.desc())
        return db.exec(statement.offset(offset).limit(per_page))

    def create(self, db: Session, obj_in: OrderCreate, user_id: int) -> Order:
        import random
        import string

        db_obj = Order.model_validate(
            obj_in,
            update={
                "user_id": user_id,
                "order_number": "TBO"
                + "".join(random.choices(string.ascii_uppercase + string.digits, k=8)),
                "status": "SUBMITTED",
            },
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


order = CRUDOrder(Order)
