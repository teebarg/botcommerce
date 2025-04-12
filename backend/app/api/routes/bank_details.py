from fastapi import APIRouter, Depends, HTTPException
from prisma.models import BankDetails
from app.models.bank_details import BankDetailsCreate, BankDetailsUpdate
from app.core.deps import get_current_superuser
from app.prisma_client import prisma as db

router = APIRouter()

@router.get("/")
async def list_bank_details() -> list[BankDetails]:
    return await db.bankdetails.find_many()


@router.get("/{id}")
async def get_bank_details(id: int) -> BankDetails:
    bank_details = await db.bankdetails.find_unique(
        where={"id": id}
    )
    if not bank_details:
        raise HTTPException(status_code=404, detail="Bank details not found")
    return bank_details


@router.post("/", dependencies=[Depends(get_current_superuser)])
async def create_bank_details(bank_details: BankDetailsCreate) -> BankDetails:
    try:
        return await db.bankdetails.create(data=bank_details.model_dump())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{id}", dependencies=[Depends(get_current_superuser)])
async def update_bank_details(
    id: int,
    bank_details: BankDetailsUpdate,
) -> BankDetails:
    try:
        return await db.bankdetails.update(
            where={"id": id},
            data=bank_details.model_dump(exclude_unset=True)
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{id}", dependencies=[Depends(get_current_superuser)])
async def delete_bank_details(id: int):
    try:
        await db.bankdetails.delete(where={"id": id})
        return {"message": "Bank details deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))