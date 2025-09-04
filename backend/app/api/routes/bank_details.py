from fastapi import APIRouter, Depends, HTTPException, Request
from prisma.models import BankDetails
from app.models.bank_details import BankDetailsCreate, BankDetailsUpdate
from app.core.deps import get_current_superuser, RedisClient
from app.prisma_client import prisma as db
from app.services.redis import cache_response

router = APIRouter()

@router.get("/")
@cache_response("bank-details")
async def list_bank_details(request: Request) -> list[BankDetails]:
    return await db.bankdetails.find_many()


@router.post("/", dependencies=[Depends(get_current_superuser)])
async def create_bank_details(bank_details: BankDetailsCreate, redis: RedisClient) -> BankDetails:
    try:
        bank_details = await db.bankdetails.create(data=bank_details.model_dump())
        await redis.invalidate_list_cache("bank-details")
        return bank_details
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{id}", dependencies=[Depends(get_current_superuser)])
async def update_bank_details(
    id: int,
    bank_details: BankDetailsUpdate,
    redis: RedisClient
) -> BankDetails:
    try:
        bank_details = await db.bankdetails.update(
            where={"id": id},
            data=bank_details.model_dump(exclude_unset=True)
        )
        await redis.invalidate_list_cache("bank-details")
        return bank_details
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{id}", dependencies=[Depends(get_current_superuser)])
async def delete_bank_details(id: int, redis: RedisClient):
    try:
        await db.bankdetails.delete(where={"id": id})
        await redis.invalidate_list_cache("bank-details")
        return {"message": "Bank details deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
