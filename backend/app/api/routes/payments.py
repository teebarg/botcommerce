from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.core.config import settings
from app.schemas.payment import (
    PaymentInitialize,
    PaymentListResponse,
)
from app.models.order import OrderCreate, OrderResponse
from app.core.deps import CurrentUser, Notification
from app.models.user import User
import httpx
from datetime import datetime
from app.prisma_client import prisma as db
from prisma.enums import PaymentStatus, PaymentMethod, OrderStatus
from prisma.errors import PrismaError
from pydantic import BaseModel
from prisma.models import Cart
from app.services.order import create_order_from_cart, send_notification

router = APIRouter()

PAYSTACK_SECRET_KEY = settings.PAYSTACK_SECRET_KEY
PAYSTACK_BASE_URL = "https://api.paystack.co"

class PaymentCreate(BaseModel):
    order_id: int
    amount: float
    reference: str
    transaction_id: str

async def initialize_payment(cart: Cart, user: User) -> PaymentInitialize:
    """Initialize a Paystack payment"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PAYSTACK_BASE_URL}/transaction/initialize",
            json={
                "email": user.email,
                # "amount": int(cart.total * 100),  # Convert to kobo
                "amount": 500,  # Convert to kobo
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

@router.post("/initialize/{cart_number}", response_model=PaymentInitialize)
async def create_payment(
    cart_number: str,
    current_user: CurrentUser
):
    """Initialize a new payment"""
    cart = await db.cart.find_unique(where={"cart_number": cart_number})

    if cart.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to pay for this cart")

    # if order.status in ["CANCELLED", "REFUNDED"]:
    #     raise HTTPException(status_code=400, detail="Cannot pay for cancelled or refunded order")

    return await initialize_payment(cart, current_user)

@router.get("/verify/{reference}", response_model=OrderResponse)
async def verify_payment(background_tasks: BackgroundTasks, reference: str, user: CurrentUser, notification: Notification):
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

        order_in = OrderCreate(status=OrderStatus.PAID, payment_status=PaymentStatus.SUCCESS)

        if data["data"]["status"] == "success":
            cart_number = data["data"]["metadata"]["cart_number"]

            order = await create_order_from_cart(order_in=order_in, user_id=user.id, cart_number=cart_number)
            background_tasks.add_task(send_notification, id=order.id, user_id=user.id, notification=notification)

            await db.payment.create(
                data={
                    "order": {"connect": {"id": order.id}},
                    "amount": data["data"]["amount"] / 100,  # Convert from kobo
                    "reference": data["data"]["reference"],
                    "transaction_id": data["data"]["reference"],
                    "status": PaymentStatus.SUCCESS,
                    "payment_method": PaymentMethod.PAYSTACK,
                }
            )

            return order
        else:
            raise HTTPException(status_code=500, detail="Payment verification failed")


@router.post("/")
async def create(*, create: PaymentCreate, user: CurrentUser):
    """
    Create new payment.
    """
    try:
        order = await db.order.find_unique(where={"id": create.order_id})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        await db.order.update(
            where={"id": create.order_id},
            data={"status": OrderStatus.PAID}
        )

        payment = await db.payment.create(
            data={
                "order": {"connect": {"id": create.order_id}},
                "amount": create.amount,
                "reference": create.reference,
                "transaction_id": create.transaction_id,
                "status": PaymentStatus.SUCCESS,
                "payment_method": PaymentMethod.PAYSTACK,
            }
        )
        return payment
    except PrismaError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

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