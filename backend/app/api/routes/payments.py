from fastapi import APIRouter, HTTPException
from app.core.config import settings
from app.schemas.payment import (
    PaymentInitialize,
    PaymentVerify,
    PaymentListResponse,
)
from app.models.order import Order
from app.core.deps import CurrentUser
from app.models.user import User
import httpx
from datetime import datetime
from app.prisma_client import prisma as db

router = APIRouter()

PAYSTACK_SECRET_KEY = settings.PAYSTACK_SECRET_KEY
PAYSTACK_BASE_URL = "https://api.paystack.co"

async def initialize_payment(order: Order, user: User) -> PaymentInitialize:
    """Initialize a Paystack payment"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PAYSTACK_BASE_URL}/transaction/initialize",
            json={
                "email": user.email,
                "amount": int(order.total * 100),  # Convert to kobo
                "reference": f"ORDER-{order.id}-{datetime.now().timestamp()}",
                "callback_url": f"{settings.FRONTEND_URL}/payment/verify",
                "metadata": {
                    "order_id": order.id,
                    "user_id": user.id,
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

@router.post("/initialize/{order_id}", response_model=PaymentInitialize)
async def create_payment(
    order_id: int,
    current_user: CurrentUser
):
    """Initialize a new payment"""
    order = await db.order.find_unique(where={"id": order_id})

    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to pay for this order")

    if order.status in ["CANCELLED", "REFUNDED"]:
        raise HTTPException(status_code=400, detail="Cannot pay for cancelled or refunded order")

    return await initialize_payment(order, current_user)

@router.get("/verify/{reference}", response_model=PaymentVerify)
async def verify_payment(reference: str):
    """Verify a payment"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{PAYSTACK_BASE_URL}/transaction/verify/{reference}",
            headers={
                "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
            }
        )

        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to verify payment")

        data = response.json()

        if data["data"]["status"] == "success":
            # Update order status
            order_id = data["data"]["metadata"]["order_id"]
            order = await db.order.find_unique(where={"id": order_id})
            if not order:
                raise HTTPException(status_code=404, detail="Order not found")
            await db.order.update(
                where={"id": order_id},
                data={"status": OrderStatus.PROCESSING}
            )

            # Create payment record
            payment = await db.payment.create(
                data={
                    "order_id": order_id,
                    "amount": data["data"]["amount"] / 100,  # Convert from kobo
                    "reference": data["data"]["reference"],
                    "status": PaymentStatus.success,
                    "payment_method": "paystack",
                    "metadata": data["data"],
                }
            )

            return PaymentVerify(
                status="success",
                message="Payment verified successfully",
                payment_id=payment.id,
            )
        else:
            return PaymentVerify(
                status="failed",
                message="Payment verification failed",
            )

@router.get("/list", response_model=PaymentListResponse)
async def list_payments(
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 10,
):
    """List payments for the current user"""
    payments = await db.payment.find_many(
        where={"user_id": current_user.id},
        skip=skip,
        take=limit,
    )
    total = await db.payment.count(where={"user_id": current_user.id})

    return PaymentListResponse(
        payments=payments,
        total=total,
        page=skip // limit + 1,
        limit=limit,
    )