from fastapi import APIRouter, Depends, HTTPException, Request
from app.models.bank_details import BankDetails, BankDetailsCreate, BankDetailsUpdate
from app.core.permissions import require_admin
from app.prisma_client import prisma as db
from app.services.redis import cache_response, refresh_data
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()

@router.get("/")
@cache_response("bank-details")
async def list_bank_details(request: Request) -> list[BankDetails]:
    return await db.bankdetails.find_many()


@router.post("/", dependencies=[Depends(require_admin)])
async def create_bank_details(bank_details: BankDetailsCreate) -> BankDetails:
    try:
        bank_details = await db.bankdetails.create(data=bank_details.model_dump())
        await refresh_data(patterns=["bank-details"])
        return bank_details
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{id}", dependencies=[Depends(require_admin)])
async def update_bank_details(
    id: int,
    bank_details: BankDetailsUpdate,
) -> BankDetails:
    try:
        bank_details = await db.bankdetails.update(
            where={"id": id},
            data=bank_details.model_dump(exclude_unset=True)
        )
        await refresh_data(patterns=["bank-details"])
        return bank_details
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{id}", dependencies=[Depends(require_admin)])
async def delete_bank_details(id: int):
    try:
        await db.bankdetails.delete(where={"id": id})
        await refresh_data(patterns=["bank-details"])
        return {"message": "Bank details deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
