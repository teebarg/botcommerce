import hashlib
import hmac
import httpx
from fastapi import APIRouter, HTTPException, Depends, Response, Request, Header
from prisma.enums import PaymentStatus, PaymentMethod
from app.core.config import settings
from app.schemas.payment import PaymentInitialize
from app.models.order import Order
from app.core.deps import CurrentUser
from app.models.user import User
from datetime import datetime
from app.core.logging import get_logger
from app.models.cart import Cart
from app.core.permissions import require_admin
from app.core.dependencies.order import OrderDep
from app.prisma_client import DbDep

logger = get_logger(__name__)

router = APIRouter()

PAYSTACK_SECRET_KEY = settings.PAYSTACK_SECRET_KEY
PAYSTACK_BASE_URL = "https://api.paystack.co"

async def initialize_payment(cart: Cart, user: User) -> PaymentInitialize:
    """Initialize a Paystack payment"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{PAYSTACK_BASE_URL}/transaction/initialize",
                json={
                    "email": user.email,
                    "amount": int(cart.total * 100),  # Convert to kobo
                    "reference": f"CART-{cart.id}-{datetime.now().timestamp()}",
                    "callback_url": f"{settings.FRONTEND_HOST}/payment/verify",
                    "metadata": {
                        "cart_number": cart.cart_number,
                        "user_id": user.id,
                        "cart_id": cart.id,
                    }
                },
                headers={
                    "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
                    "Content-Type": "application/json",
                }
            )

            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to initialize payment")

            data = response.json()
            return PaymentInitialize(
                authorization_url=data["data"]["authorization_url"],
                reference=data["data"]["reference"],
                access_code=data["data"]["access_code"],
            )
        except Exception as e:
            logger.error(f"Failed to initialize payment: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to initialize payment: {str(e)}")

@router.post("/initialize/{cart_number}", response_model=PaymentInitialize)
async def create_payment(
    cart_number: str,
    db: DbDep,
    current_user: CurrentUser
):
    """Initialize a new payment"""
    cart = await db.cart.find_unique(where={"cart_number": cart_number})

    if cart.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not authorized to pay for this cart")

    return await initialize_payment(cart, current_user)

@router.get("/verify/{reference}")
async def verify_payment(response: Response, srv: OrderDep, reference: str, user: CurrentUser) -> Order:
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{PAYSTACK_BASE_URL}/transaction/verify/{reference}",
            headers={"Authorization": f"Bearer {PAYSTACK_SECRET_KEY}"},
        )

        if res.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to verify payment")

        data = res.json()

        if data["data"]["status"] != "success":
            raise HTTPException(status_code=400, detail="Payment verification failed")

        order = await srv.record_payment_success(
            reference=data["data"]["reference"],
            amount=data["data"]["amount"] / 100,
            cart_number=data["data"]["metadata"]["cart_number"],
            user_id=int(data["data"]["metadata"]["user_id"]),
        )

        response.delete_cookie(
            key="_cart_id", path="/", httponly=True, samesite="none",
            secure=True, domain=settings.COOKIE_DOMAIN,
        )
        return order


@router.post("/webhooks/paystack")
async def paystack_webhook(request: Request, srv: OrderDep, x_paystack_signature: str = Header(...)):
    body = await request.body()
    computed_sig = hmac.new(PAYSTACK_SECRET_KEY.encode(), body, hashlib.sha512).hexdigest()
    if not hmac.compare_digest(computed_sig, x_paystack_signature):
        raise HTTPException(status_code=403, detail="Invalid signature")

    payload = await request.json()
    if payload["event"] == "charge.success":
        data = payload["data"]
        await srv.record_payment_success(
            reference=data["reference"],
            amount=data["amount"] / 100,
            cart_number=data["metadata"]["cart_number"],
            user_id=data["metadata"]["user_id"],
        )

    return {"status": "received"}


@router.patch("/{id}/status", dependencies=[Depends(require_admin)])
async def payment_status(db: DbDep, srv: OrderDep, id: int, status: PaymentStatus) -> Order:
    """Change payment status"""
    order = await db.order.find_unique(where={"id": id}, include={"order_items": {"include": {"variant": True}}})
    if not order:
        raise HTTPException(status_code=404, detail="order not found")

    for item in order.order_items:
        if item.variant and item.variant.inventory < item.quantity:
            raise HTTPException(status_code=400, detail="order has out of stock items, cannot update payment status")

    if status == PaymentStatus.SUCCESS:
        updated_order = await srv._finalize_paid_order(
            order=order,
            amount=order.total,
            reference=f"ADMIN-BANK-{order.order_number}",
            payment_method=PaymentMethod.BANK_TRANSFER,
        )
        try:
            await db.ordertimeline.create(
                data={
                    "order": {"connect": {"id": id}},
                    "from_status": order.status,
                    "to_status": order.status,
                    "message": "Payment confirmed by admin (bank transfer)",
                }
            )
        except Exception as e:
            logger.error(f"Failed to create order timeline when updating payment status: {str(e)}")
        await srv.cache_srv.invalidate(f"order:{id}", f"order-timeline:{id}", tags=["orders"])
        return updated_order

    # Any other status transition (e.g. FAILED, PENDING)
    updated_order = await db.order.update(where={"id": id}, data={"payment_status": status})
    await srv.cache_srv.invalidate(f"order:{id}", tags=["orders"])
    return updated_order
