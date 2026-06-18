from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Request, Query
from pydantic import BaseModel
from prisma.enums import WalletTransactionType
from app.prisma_client import prisma as db
from app.core.deps import  CurrentUser
from app.core.permissions import require_admin
from app.services.cache import cacheable

class WalletTxn(BaseModel):
    id: str
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

@router.get("/", dependencies=[Depends(require_admin)])
@cacheable(key_prefix="wallets", tags=["wallets"])
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
@cacheable(key_prefix="wallet", tags=lambda user: [f"wallet:{user.id}"])
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