import hashlib
import hmac

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from prisma.enums import PaymentStatus

from app.core.config import settings
from app.core.dependencies.order import OrderDep, PaymentDep
from app.core.deps import CurrentUser
from app.core.logging import get_logger
from app.core.permissions import require_admin
from app.models.order import Order
from app.prisma_client import DbDep
from app.schemas.payment import PaymentInitialize

logger = get_logger(__name__)

router = APIRouter()

PAYSTACK_SECRET_KEY = settings.PAYSTACK_SECRET_KEY
PAYSTACK_BASE_URL = "https://api.paystack.co"


@router.post("/initialize/{order_id}", response_model=PaymentInitialize)
async def initialize_payment(
    order_id: int,
    srv: OrderDep,
    payment_srv: PaymentDep,
    user: CurrentUser
):
    """Initialize a new payment"""
    order = await srv.get_by_id(order_id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="order not found")

    if order.user_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if order.payment_status == PaymentStatus.SUCCESS:
        raise HTTPException(
            status_code=400,
            detail="order has already been paid",
        )

    return await payment_srv.initialize_paystack(order=order)

@router.get("/verify/{reference}")
async def verify_payment(payment_srv: PaymentDep, reference: str) -> Order:
    order = await payment_srv.verify_paystack(reference)
    return order

@router.post("/webhooks/paystack")
async def paystack_webhook(request: Request, payment_srv: PaymentDep, x_paystack_signature: str = Header(...)):
    body = await request.body()
    computed_sig = hmac.new(PAYSTACK_SECRET_KEY.encode(), body, hashlib.sha512).hexdigest()
    if not hmac.compare_digest(computed_sig, x_paystack_signature):
        raise HTTPException(status_code=403, detail="Invalid signature")

    payload = await request.json()
    if payload["event"] == "charge.success":
        data = payload["data"]
        await payment_srv.record_success(
            reference=data["reference"],
        )

    return {"status": "received"}

@router.patch("/{id}/status", dependencies=[Depends(require_admin)])
async def change_payment_status(db: DbDep, srv: OrderDep, id: int, status: PaymentStatus, payment_srv: PaymentDep) -> Order:
    """Change payment status"""
    order = await db.order.find_unique(where={"id": id}, include={"order_items": {"include": {"variant": True}}})
    if not order:
        raise HTTPException(status_code=404, detail="order not found")

    for item in order.order_items:
        if item.variant and item.variant.inventory < item.quantity:
            raise HTTPException(status_code=400, detail="order has out of stock items, cannot update payment status")

    if status == PaymentStatus.SUCCESS:
        await payment_srv.record_success(
            reference=f"{order.payment_method}-{order.order_number}",
        )
        await srv.cache_srv.invalidate(f"order:{id}", f"order-timeline:{id}", tags=["orders"])
        return order

    # Any other status transition (e.g. FAILED, PENDING)
    updated_order = await db.order.update(where={"id": id}, data={"payment_status": status})
    await srv.cache_srv.invalidate(f"order:{id}", tags=["orders"])
    return updated_order
