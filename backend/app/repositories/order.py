import asyncio
from typing import Optional, Dict, Any
from prisma import Prisma

class OrderRepository:
    def __init__(self, db: Prisma):
        self.db = db

    async def get_by_number(self, order_number: str, include_relations: bool = True) -> Any:
        if not include_relations:
            return await self.db.order.find_unique(where={"order_number": order_number})
        
        return await self.db.order.find_unique(
            where={"order_number": order_number},
            include={
                "order_items": {"include": {"variant": True}},
                "user": True,
                "shipping_address": True
            }
        )

    async def get_by_id(self, order_id: int, include_relations: bool = False) -> Any:
        include_clause = {
            "order_items": {"include": {"variant": True}},
            "user": True,
            "shipping_address": True
        } if include_relations else None
        
        return await self.db.order.find_unique(where={"id": order_id}, include=include_clause)

    async def list_paginated(
        self,
        user_id: int,
        cursor: Optional[int] = None,
        limit: int = 20,
        status: Optional[str] = None,
        order_number: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        customer_id: Optional[int] = None,
        user_role: str = "CUSTOMER",
        sort: str = "desc"
    ) -> Dict[str, Any]:
        where: Dict[str, Any] = {}
        if status:
            where["status"] = status
        if customer_id:
            where["user_id"] = customer_id
        if order_number:
            where["order_number"] = order_number
        if user_role == "CUSTOMER":
            where["user_id"] = user_id
        if start_date:
            where["created_at"] = {"gte": start_date}
        if end_date:
            where["created_at"] = {"lte": end_date}

        orders = await self.db.order.find_many(
            where=where,
            order={"created_at": sort},
            skip=1 if cursor else 0,
            take=limit + 1,
            cursor={"id": cursor} if cursor else None,
            include={
                "order_items": {"include": {"variant": True}},
                "user": True,
                "shipping_address": True,
                "coupon": True,
            }
        )
        
        items = orders[:limit]
        next_cursor = items[-1].id if len(orders) > limit else None
        
        return {
            "items": items,
            "next_cursor": next_cursor,
            "limit": limit
        }