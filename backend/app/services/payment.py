import httpx
from arq.connections import ArqRedis
from fastapi import HTTPException
from prisma.enums import OrderStatus, PaymentStatus
from prisma.models import Order

from app.core.config import settings
from app.core.logging import get_logger
from app.schemas.payment import PaymentInitialize
from app.services.cache import CacheService
from app.services.product import ProductService
from prisma import Prisma

logger = get_logger(__name__)

PAYSTACK_BASE_URL = "https://api.paystack.co"


class PaymentService:
    def __init__(self, db: Prisma, queue: ArqRedis, cache_srv: CacheService, product_srv: ProductService):
        self.db = db
        self.queue = queue
        self.cache_srv = cache_srv
        self.product_srv = product_srv

    async def initialize_paystack(
        self,
        order: Order,
    ) -> PaymentInitialize:

        reference = f"{order.payment_method}-{order.order_number}"

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{PAYSTACK_BASE_URL}/transaction/initialize",
                json={
                    "email": order.email,
                    "amount": int(order.total * 100),
                    "reference": reference,
                    "callback_url": (f"{settings.FRONTEND_HOST}/payment/verify"),
                    "metadata": {
                        "order_id": order.id,
                    },
                },
                headers={
                    "Authorization": (f"Bearer {settings.PAYSTACK_SECRET_KEY}"),
                    "Content-Type": "application/json",
                },
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail="Failed to initialize payment",
            )

        data = response.json()["data"]

        return PaymentInitialize(
            authorization_url=data["authorization_url"],
            reference=data["reference"],
            access_code=data["access_code"],
        )

    async def verify_paystack(
        self,
        reference: str,
    ):
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{PAYSTACK_BASE_URL}/transaction/verify/{reference}",
                headers={
                    "Authorization": (f"Bearer {settings.PAYSTACK_SECRET_KEY}"),
                },
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail="Failed to verify payment",
            )

        data = response.json()["data"]

        if data["status"] != "success":
            raise HTTPException(
                status_code=400,
                detail="Payment verification failed",
            )

        return await self.record_success(reference=data["reference"])

    async def record_success(self, reference: str):
        print("🚀 ~ PaymentService ~ record_success ~ reference:", reference)
        payment = await self.db.payment.find_first(
            where={"reference": reference},
            include={"order": True},
        )

        if not payment:
            raise HTTPException(
                status_code=404,
                detail="Payment not found",
            )

        if payment.status == "SUCCESS":
            return payment.order

        async with self.db.tx() as tx:
            await tx.payment.update(
                where={"id": payment.id},
                data={
                    "status": "SUCCESS",
                },
            )

            order = await tx.order.update(
                where={"id": payment.order_id},
                data={
                    "payment_status": PaymentStatus.SUCCESS,
                    "status": OrderStatus.PROCESSING,
                },
            )

            await tx.ordertimeline.create(
                data={
                    "order": {"connect": {"id": payment.order_id}},
                    "from_status": order.status,
                    "to_status": OrderStatus.PROCESSING,
                    "message": "Payment confirmed.",
                }
            )

        await self.cache_srv.invalidate(f"order:{payment.order_id}", f"order-timeline:{payment.order_id}", tags=["orders"])
        await self._finalize_paid_order(order_id=payment.order_id)
        return order

    async def _finalize_paid_order(self, order_id: int):
        """
        Single source of truth for marking an order paid — records the Payment 1-1 relation check
        """
        order = await self.db.order.find_unique(
            where={"id": order_id},
            include={
                "order_items": {"include": {"variant": True}},
            },
        )
        if not order:
            logger.error(f"Order not found for ID: {order_id}")
            raise Exception("Order not found")

        product_ids = []
        for item in order.order_items:
            await self.db.productvariant.update(
                where={"id": item.variant_id},
                data={"inventory": {"decrement": item.quantity}},
            )
            product_ids.append(item.variant.product_id)

        await self.product_srv.index_products(product_ids=product_ids)
        await self.queue.enqueue_job("process_referral", order_id=order_id)
        await self.queue.enqueue_job("generate_and_send_invoice", order_id=order_id)
