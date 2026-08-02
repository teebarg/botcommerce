
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
)
from app.core.deps import CurrentUser
from app.models.address import (
    Address,
    Addresses,
    AddressCreate,
    AddressUpdate,
)
from app.models.generic import Message
from app.prisma_client import prisma as db
from prisma.errors import PrismaError
from app.core.logging import get_logger
from app.services.cache import cacheable
from app.core.dependencies.cache import CacheDep
from app.core.dependencies.order import OrderDep
from app.core.security import verify_internal_signature

logger = get_logger(__name__)

router = APIRouter()


@router.post(
    "/orders/{order_id}/generate-invoice",
    include_in_schema=True,  # hide from /docs and /openapi.json
    dependencies=[Depends(verify_internal_signature)],
)
async def internal_generate_invoice(order_id: int, order_srv: OrderDep):
    return {"status": "ok", "invoice_url": "https://example.com/invoice"}
    # order = await order_srv.db.order.find_unique(
    #     where={"id": order_id},
    #     include={"order_items": {"include": {"variant": True}}, "user": True},
    # )
    # if not order:
    #     raise HTTPException(status_code=404, detail="Order not found")

    # await order_srv.create_invoice(order_id)

    # order = await order_srv.db.order.find_unique(
    #     where={"id": order_id},
    #     include={"order_items": {"include": {"variant": True}}, "user": True},
    # )
    # await order_srv.send_payment_receipt(order=order)

    # return {"status": "ok", "invoice_url": order.invoice_url}
