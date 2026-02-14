from typing import Optional
from fastapi import APIRouter, Depends, Request, Query
from pydantic import BaseModel
from app.prisma_client import prisma as db
from app.services.redis import cache_response
from app.core.deps import get_current_superuser
from app.models.user import User
from datetime import datetime
from enum import Enum

class WalletType(str, Enum):
    CASHBACK = "CASHBACK"
    WITHDRAWAL = "WITHDRAWAL"
    ADJUSTMENT = "ADJUSTMENT"
    REVERSAL = "REVERSAL"

class WalletTransaction(BaseModel):
    id: str
    user_id: int
    user: User
    amount: float
    type: WalletType
    reference_code: Optional[str] = None
    reference_id: Optional[str] = None
    created_at: datetime

class PaginatedWalletTransactions(BaseModel):
    data: list[WalletTransaction]
    next_cursor: Optional[str]
    limit: int

router = APIRouter()

@router.get("/", dependencies=[Depends(get_current_superuser)])

@cache_response(key_prefix="wallet")
async def index(
    request: Request,
    query: str = "",
    cursor: str | None = None,
    limit: int = Query(default=20, le=100),
) -> PaginatedWalletTransactions:
    """
    Retrieve all wallet transactions.
    """
    where_clause = {}
    if query:
        where_clause = {
            "OR": [
                {"reference_code": {"contains": query, "mode": "insensitive"}},
                {"reference_id": {"contains": query, "mode": "insensitive"}}
            ]
        }

    transactions = await db.wallettransaction.find_many(
        where=where_clause,
        include={"user": True},
        order={"created_at": "desc"},
        take=limit + 1,
        skip=1 if cursor else 0,
        cursor={"id": cursor} if cursor else None,
    )

    items = transactions[:limit]

    next_cursor: str | None = items[-1].id if len(transactions) > limit else None

    return {
        "data": items,
        "next_cursor": next_cursor,
        "limit": limit
    }
