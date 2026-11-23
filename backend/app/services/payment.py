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

_http_client: httpx.AsyncClient | None = None


def _get_http_client() -> httpx.AsyncClient:
    """One shared client (connection reuse, TLS handshake once) with sane timeouts."""
    global _http_client
    if _http_client is None or _http_client.is_closed:
        _http_client = httpx.AsyncClient(timeout=httpx.Timeout(15.0, connect=5.0))
    return _http_client


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

        try:
            response = await _get_http_client().post(
                f"{PAYSTACK_BASE_URL}/transaction/initialize",
                json={
                    "email": order.email,
                    "amount": round(order.total * 100),
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
        except httpx.HTTPError as e:
            logger.error(f"Paystack initialize failed: {e}")
            raise HTTPException(status_code=502, detail="Payment provider unreachable")

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
        try:
            response = await _get_http_client().get(
                f"{PAYSTACK_BASE_URL}/transaction/verify/{reference}",
                headers={
                    "Authorization": (f"Bearer {settings.PAYSTACK_SECRET_KEY}"),
                },
            )
        except httpx.HTTPError as e:
            logger.error(f"Paystack verify failed: {e}")
            raise HTTPException(status_code=502, detail="Payment provider unreachable")

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

        return await self.record_success(reference=data["reference"], paid_kobo=data.get("amount"))

    async def record_success(self, reference: str, paid_kobo: int | None = None):
        """Mark a payment successful. Safe to call repeatedly and concurrently (the webhook and
        the browser's verify call usually race): only the call that wins the atomic claim below
        decrements stock and queues jobs.

        `paid_kobo` is the amount Paystack reports; if given it must cover the order total.
        """
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

        if paid_kobo is not None and paid_kobo < round(float(payment.amount) * 100):
            logger.error(
                f"Underpayment for {reference}: paid {paid_kobo} kobo, expected {round(float(payment.amount) * 100)}"
            )
            raise HTTPException(status_code=400, detail="Amount paid does not match the order total")

        oversold: list[str] = []
        product_ids: set[int] = set()

        async with self.db.tx() as tx:
            # Atomic claim: only one concurrent caller flips the payment to SUCCESS.
            claimed = await tx.payment.update_many(
                where={"id": payment.id, "status": {"not": "SUCCESS"}},
                data={"status": "SUCCESS"},
            )
            if claimed == 0:
                return payment.order  # someone else already processed it

            order = await tx.order.update(
                where={"id": payment.order_id},
                data={
                    "payment_status": PaymentStatus.SUCCESS,
                    "status": OrderStatus.PROCESSING,
                },
                include={"order_items": {"include": {"variant": True}}},
            )

            await tx.ordertimeline.create(
                data={
                    "order": {"connect": {"id": payment.order_id}},
                    "from_status": payment.order.status,
                    "to_status": OrderStatus.PROCESSING,
                    "message": "Payment confirmed.",
                }
            )

            # Stock moves in the same transaction as the payment, and never below zero.
            for item in order.order_items:
                if item.variant_id is None:
                    continue
                if item.variant:
                    product_ids.add(item.variant.product_id)

                decremented = await tx.productvariant.update_many(
                    where={"id": item.variant_id, "inventory": {"gte": item.quantity}},
                    data={"inventory": {"decrement": item.quantity}},
                )
                if decremented == 0:
                    # Paid, but stock ran out in the meantime. Don't fail the payment: take what is
                    # left, and flag the order so someone can contact the customer.
                    oversold.append(f"{item.name} x{item.quantity}")
                    await tx.productvariant.update_many(
                        where={"id": item.variant_id}, data={"inventory": 0}
                    )
                await tx.productvariant.update_many(
                    where={"id": item.variant_id, "inventory": {"lte": 0}},
                    data={"status": "OUT_OF_STOCK"},
                )

            if oversold:
                await tx.ordertimeline.create(
                    data={
                        "order": {"connect": {"id": payment.order_id}},
                        "from_status": OrderStatus.PROCESSING,
                        "to_status": OrderStatus.PROCESSING,
                        "message": f"ATTENTION: stock ran out before this paid order was confirmed: {', '.join(oversold)}",
                    }
                )

        if oversold:
            logger.error(f"Oversold on paid order {payment.order_id}: {oversold}")

        # After commit: caches, search index, background jobs. None of these may fail the payment.
        await self._after_payment_committed(order_id=payment.order_id, product_ids=list(product_ids))
        return order

    async def _after_payment_committed(self, order_id: int, product_ids: list[int]) -> None:
        try:
            await self.cache_srv.invalidate(
                f"order:{order_id}", f"order-timeline:{order_id}", tags=["orders"]
            )
            if product_ids:
                await self.product_srv.index_products(product_ids=product_ids)
        except Exception as e:
            logger.error(f"Post-payment cache/index refresh failed for order {order_id}: {e}")

        for job in ("process_referral", "generate_and_send_invoice"):
            try:
                await self.queue.enqueue_job(job, order_id=order_id)
            except Exception as e:
                # Payment is committed; a retry would see SUCCESS and skip, so log loudly instead.
                logger.critical(f"Order {order_id} paid but job '{job}' was not queued: {e}")
