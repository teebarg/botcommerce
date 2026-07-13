from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from app.models.bank_details import BankDetails, BankDetailsCreate, BankDetailsUpdate
from app.core.permissions import require_admin
from app.prisma_client import prisma as db
from app.services.cache import cacheable
from app.core.logging import get_logger
from app.core.dependencies.services import BankDetailsDep

logger = get_logger(__name__)

router = APIRouter()

@router.get("/")
@cacheable(
    key_prefix="bank-details",
    tags=["bank-details"],
    expire=2592000,
    browser_ttl=600, cdn_ttl=31536000, cdn_swr=604800
)
async def index(request: Request) -> list[BankDetails]:
    return await db.bankdetails.find_many(order={"created_at": "desc"})


@router.post("/", dependencies=[Depends(require_admin)])
async def create(bank_details: BankDetailsCreate, srv: BankDetailsDep, bg_tasks: BackgroundTasks) -> BankDetails:
    try:
        bank_details = await db.bankdetails.create(data=bank_details.model_dump())
        bg_tasks.add_task(srv.invalidate)
        return bank_details
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{id}", dependencies=[Depends(require_admin)])
async def update(
    id: int,
    bank_details: BankDetailsUpdate,
    srv: BankDetailsDep,
    bg_tasks: BackgroundTasks
) -> BankDetails:
    try:
        bank_details = await db.bankdetails.update(
            where={"id": id},
            data=bank_details.model_dump(exclude_unset=True)
        )
        bg_tasks.add_task(srv.invalidate)
        return bank_details
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{id}", dependencies=[Depends(require_admin)])
async def delete(id: int, srv: BankDetailsDep, bg_tasks: BackgroundTasks):
    try:
        await db.bankdetails.delete(where={"id": id})
        bg_tasks.add_task(srv.invalidate)
        return {"message": "Bank details deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
