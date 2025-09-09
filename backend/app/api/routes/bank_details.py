from fastapi import APIRouter, Depends, HTTPException, Request
from prisma.models import BankDetails
from app.models.bank_details import BankDetailsCreate, BankDetailsUpdate
from app.core.deps import get_current_superuser
from app.prisma_client import prisma as db
from app.services.redis import cache_response, invalidate_list
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()

@router.get("/")
@cache_response("bank-details")
async def list_bank_details(request: Request) -> list[BankDetails]:
    return await db.bankdetails.find_many()


@router.post("/", dependencies=[Depends(get_current_superuser)])
async def create_bank_details(bank_details: BankDetailsCreate) -> BankDetails:
    try:
        bank_details = await db.bankdetails.create(data=bank_details.model_dump())
        await invalidate_list("bank-details")
        return bank_details
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{id}", dependencies=[Depends(get_current_superuser)])
async def update_bank_details(
    id: int,
    bank_details: BankDetailsUpdate,
) -> BankDetails:
    try:
        bank_details = await db.bankdetails.update(
            where={"id": id},
            data=bank_details.model_dump(exclude_unset=True)
        )
        await invalidate_list("bank-details")
        return bank_details
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{id}", dependencies=[Depends(get_current_superuser)])
async def delete_bank_details(id: int):
    try:
        await db.bankdetails.delete(where={"id": id})
        await invalidate_list("bank-details")
        return {"message": "Bank details deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
