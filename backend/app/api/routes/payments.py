from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from app.core.config import settings
from app.schemas.payment import PaymentInitialize
from app.models.order import OrderCreate, OrderResponse
from app.core.deps import CurrentUser, Notification, RedisClient, get_current_user
from app.models.user import User
import httpx
from datetime import datetime
from app.prisma_client import prisma as db
from prisma.enums import PaymentStatus, PaymentMethod, OrderStatus
from pydantic import BaseModel
from prisma.models import Cart
from app.services.order import create_order_from_cart, decrement_variant_inventory_for_order
from app.core.logging import get_logger
from app.services.events import publish_event, publish_order_event

logger = get_logger(__name__)

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
        try:
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
        except Exception as e:
            logger.error(f"Failed to initialize payment: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to initialize payment: {str(e)}")

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
async def verify_payment(reference: str, user: CurrentUser, cache: RedisClient, background_tasks: BackgroundTasks):
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

        order_in = OrderCreate(status=OrderStatus.PENDING, payment_status=PaymentStatus.SUCCESS)

        if data["data"]["status"] == "success":
            cart_number = data["data"]["metadata"]["cart_number"]

            order = await create_order_from_cart(order_in=order_in, user_id=user.id, cart_number=cart_number, redis=cache.redis, background_tasks=background_tasks)
            await publish_order_event(cache=cache.redis, order=order, type="ORDER_PAID")

            event = {
                "type": "PAYMENT_SUCCESS",
                "order_id": order.id,
                "amount": data["data"]["amount"] / 100,
                "reference": data["data"]["reference"],
                "transaction_id": data["data"]["reference"],
                "status": PaymentStatus.SUCCESS,
                "payment_method": PaymentMethod.PAYSTACK,
            }
            await publish_event(cache=cache.redis, event=event)

            return order
        else:
            event = {
                "type": "PAYMENT_FAILED",
                "order_id": order.id,
                "amount": data["data"]["amount"] / 100,
                "reference": data["data"]["reference"],
                "transaction_id": data["data"]["reference"],
                "status": PaymentStatus.FAILED,
                "payment_method": PaymentMethod.PAYSTACK,
            }
            await publish_event(cache=cache.redis, event=event)
            raise HTTPException(status_code=500, detail="Payment verification failed")


@router.post("/", dependencies=[Depends(get_current_user)])
async def create(*, create: PaymentCreate, notification: Notification, cache: RedisClient, background_tasks: BackgroundTasks):
    """
    Create new payment.
    """
    order = await db.order.find_unique(where={"id": create.order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    async with db.tx() as tx:
        await tx.order.update(
            where={"id": create.order_id},
            data={"status": OrderStatus.PENDING}
        )
        payment = await tx.payment.create(
            data={
                "order": {"connect": {"id": create.order_id}},
                "amount": create.amount,
                "reference": create.reference,
                "transaction_id": create.transaction_id,
                "status": PaymentStatus.SUCCESS,
                "payment_method": PaymentMethod.PAYSTACK,
            }
        )
    background_tasks.add_task(decrement_variant_inventory_for_order, create.order_id, notification, cache)
    return payment


@router.patch("/{id}/status", response_model=OrderResponse)
async def payment_status(cache: RedisClient, id: int, status: PaymentStatus, background_tasks: BackgroundTasks, notification: Notification):
    """Change payment status"""
    order = await db.order.find_unique(where={"id": id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    data = {"payment_status": status}

    async with db.tx() as tx:
        updated_order = await tx.order.update(where={"id": id}, data=data)
        await cache.invalidate_list_cache("orders")
        await cache.bust_tag(f"order:{id}")

        if status == PaymentStatus.SUCCESS:
            await publish_order_event(cache=cache.redis, order=updated_order, type="ORDER_PAID")
            try:
                if order.status != OrderStatus.PENDING:
                    await tx.ordertimeline.create(
                        data={
                            "order": {"connect": {"id": id}},
                            "from_status": order.status,
                            "to_status": OrderStatus.PENDING,
                        }
                    )
            except Exception as e:
                logger.error(f"Failed to create order timeline: {str(e)}")
                raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")
        return updated_order
