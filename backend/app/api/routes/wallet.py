from app.core.deps import CurrentUser
from typing import Optional
from fastapi import APIRouter, Depends, Request, Query
from pydantic import BaseModel
from app.prisma_client import prisma as db
from app.services.redis import cache_response
from app.core.deps import get_current_superuser
from app.models.user import User
from datetime import datetime
from prisma.enums import WalletTransactionType

class WalletTxn(BaseModel):
    id: str
    user_id: int
    user: User
    amount: float
    type: WalletTransactionType
    reference_code: Optional[str] = None
    reference_id: Optional[str] = None
    created_at: datetime

class PaginatedWalletTxns(BaseModel):
    txns: list[WalletTxn]
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
) -> PaginatedWalletTxns:
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

    return {
        "txns": items,
        "next_cursor": items[-1].id if len(transactions) > limit else None,
        "limit": limit
    }


@router.get("/me")
@cache_response(key_prefix="wallet")
async def self_txns(
    request: Request,
    user: CurrentUser,
    cursor: str | None = None,
    limit: int = Query(default=20, le=100),
) -> PaginatedWalletTxns:
    """
    Retrieve all wallet transactions.
    """
    transactions = await db.wallettransaction.find_many(
        where={"user_id": user.id},
        include={"user": True},
        order={"created_at": "desc"},
        take=limit + 1,
        skip=1 if cursor else 0,
        cursor={"id": cursor} if cursor else None,
    )

    items = transactions[:limit]

    return {
        "txns": items,
        "next_cursor": items[-1].id if len(transactions) > limit else None,
        "limit": limit
    }