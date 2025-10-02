import asyncio
from app.core.logging import get_logger
from app.prisma_client import prisma as db
from app.core.logging import get_logger
from app.core.deps import get_notification_service
from app.services.order import send_notification, process_order_payment
from prisma.enums import OrderStatus, PaymentStatus, PaymentMethod
from app.services.recently_viewed import RecentlyViewedService
from app.services.popular_products import PopularProductsService
from prisma import Json
from datetime import datetime
from app.core.utils import generate_welcome_email
from app.services.redis import invalidate_pattern

logger = get_logger(__name__)

class RedisStreamConsumer:
    def __init__(self, redis_client, stream, group, consumer):
        self.redis = redis_client
        self.stream = stream
        self.group = group
        self.consumer = consumer
        self.shutdown_event = asyncio.Event()
        self.task = None

    async def start(self):
        """Start consumer with auto-restart supervision"""
        self.shutdown_event.clear()

        async def supervise(coro, name: str):
            """Run a task, restart on unexpected failure until shutdown."""
            while not self.shutdown_event.is_set():
                try:
                    logger.info(f"Starting task: {name}")
                    await coro()
                except asyncio.CancelledError:
                    logger.info(f"Task cancelled: {name}")
                    raise
                except Exception as e:
                    logger.exception(f"Task {name} crashed with error: {e}, restarting...")
                    await asyncio.sleep(1)
            logger.info(f"Task stopped: {name}")

        self.consume_task = asyncio.create_task(
            supervise(self.consume, "redis-consume"), name="redis-consume-supervisor"
        )
        self.claim_task = asyncio.create_task(
            supervise(self.claim_stale_messages, "redis-claim-stale"), name="redis-claim-stale-supervisor"
        )

        logger.info("Redis consumer started with supervision...")

    async def stop(self):
        """Stop consumer loops gracefully"""
        self.shutdown_event.set()

        tasks = [t for t in [self.consume_task, self.claim_task] if t]

        for task in tasks:
            logger.info(f"Cancelling task: {task.get_name()}")
            task.cancel()

        if tasks:
            try:
                await asyncio.wait_for(
                    asyncio.gather(*tasks, return_exceptions=True),
                    timeout=5.0,
                )
            except asyncio.TimeoutError:
                logger.warning("Some consumer tasks didn’t stop gracefully")

        logger.info("Redis consumer stopped.")

    async def consume(self):
        try:
            while not self.shutdown_event.is_set():
                try:
                    events = await self.redis.xreadgroup(
                        self.group,
                        self.consumer,
                        streams={self.stream: ">"},
                        count=10,
                        block=60000,  # wait up to 60s
                    )

                    if not events:
                        continue

                    for stream, messages in events:
                        for msg_id, data in messages:
                            await self._process(msg_id, data)

                except Exception as e:
                    logger.error(f"XREADGROUP error: {e}")
        except Exception as e:
            logger.exception(f"Consumer error: {e}")
            await asyncio.sleep(1)


    async def claim_stale_messages(self):
        """Run occasionally to recover stuck messages."""
        while not self.shutdown_event.is_set():
            try:
                claimed = await self.redis.xautoclaim(
                    self.stream,
                    self.group,
                    self.consumer,
                    600000,
                    "0-0",
                    count=10
                )

                for msg_id, data in claimed[1]:
                    await self._process(msg_id, data)
            except Exception as e:
                logger.error(f"XAUTOCLAIM error: {e}")

            await asyncio.sleep(60)  # only sweep every 60s (tunable)


    async def _process(self, msg_id, data):
        try:
            await self.handle_event(data)
            await self.redis.xack(self.stream, self.group, msg_id)
        except Exception as e:
            logger.error(f"Failed to process {data}: {e}")

    async def handle_event(self, event):
        if event["type"] == "ORDER_CREATED":
            await self.handle_order_created(event)
        elif event["type"] == "ORDER_PAID":
            await self.handle_order_paid(event)
        elif event["type"] == "ORDER_STATUS":
            await self.handle_order_status(event)
        elif event["type"] == "PAYMENT_SUCCESS":
            await self.handle_payment_success(event)
        elif event["type"] == "PAYMENT_FAILED":
            await self.handle_payment_failed(event)
        elif event["type"] == "RECENTLY_VIEWED":
            await self.handle_recently_viewed(event)
        elif event["type"] == "USER_REGISTERED":
            await self.handle_user_registered(event)

    def get_notification(self):
        notification = get_notification_service()
        return notification

    async def handle_order_paid(self, event):
        try:
            await process_order_payment(order_id=int(event["order_id"]), notification=self.get_notification())
        except Exception as e:
            logger.error(
                f"Failed to process order payment for order {event['order_id']}: {e}")
            raise Exception(
                f"Failed to process order payment for order {event['order_id']}")

    async def handle_order_created(self, event):
        try:
            await db.ordertimeline.create(
                data={
                    "order": {"connect": {"id": int(event["order_id"])}},
                    "message": f'Order {event["order_number"]} created',
                    "from_status": OrderStatus.PENDING,
                    "to_status": OrderStatus.PENDING,
                }
            )
            order_items = await db.orderitem.find_many(
                where={
                    "order_id": int(event["order_id"]),
                },
                include={
                    "variant": True,
                }
            )
            service = PopularProductsService()
            for item in order_items:
                await service.track_product_interaction(product_id=item.variant.product_id, interaction_type="purchase")
        except Exception as e:
            logger.error(f"Failed to create order: {str(e)}")
            raise Exception(f"Database error: {str(e)}")

        await send_notification(id=int(event["order_id"]), user_id=int(event["user_id"]), notification=self.get_notification())
        await invalidate_pattern("users")

    async def handle_payment_success(self, event):
        try:
            await db.payment.create(
                data={
                    "order": {"connect": {"id": int(event["order_id"])}},
                    "amount": float(event["amount"]),
                    "reference": event["reference"],
                    "transaction_id": event["transaction_id"],
                    "status": PaymentStatus.SUCCESS,
                    "payment_method": PaymentMethod.PAYSTACK,
                }
            )
        except Exception as e:
            logger.error(f"Failed to create order: {str(e)}")
            raise Exception(f"Database error: {str(e)}")

    async def handle_recently_viewed(self, event):
        try:
            metadata = {
                "source": event.get("source", ""),
            }
            if int(event.get("time_spent", 0)) > 0:
                metadata["time_spent"] = int(event.get("time_spent", 0))
            await db.userinteraction.create(
                data={
                    "user": {"connect": {"id": int(event["user_id"])}},
                    "product": {"connect": {"id": int(event["product_id"])}},
                    "type": event["view_type"],
                    "metadata": Json(metadata),
                    "timestamp": datetime.now(),
                }
            )
        except Exception as e:
            logger.error(f"Failed to create order: {str(e)}")
            raise Exception(f"Database error: {str(e)}")

        try:
            if event["view_type"] == "VIEW":
                recent_service = RecentlyViewedService()
                await recent_service.add_product(user_id=int(event["user_id"]), product_id=int(event["product_id"]))

                await self.handle_track_popular(product_id=int(event["product_id"]), interaction_type="view")
            elif event["view_type"] == "CART_ADD":
                await self.handle_track_popular(product_id=int(event["product_id"]), interaction_type="add_to_cart")

        except Exception as e:
            logger.error(f"Failed to add product to recently viewed: {str(e)}")
            raise Exception(f"Redis error: {str(e)}")

    async def handle_track_popular(self, product_id: int, interaction_type: str):
        recent_service = PopularProductsService()
        await recent_service.track_product_interaction(product_id=product_id, interaction_type=interaction_type)

    async def handle_user_registered(self, event):
        notification = self.get_notification()
        try:
            welcome_email = await generate_welcome_email(
                email_to=event["email"],
                first_name=event["first_name"]
            )
            await notification.send_notification(
                channel_name="email",
                recipient=event["email"],
                subject=welcome_email.subject,
                message=welcome_email.html_content
            )
        except Exception as e:
            logger.error(f"Failed to send welcome email: {str(e)}")
            raise Exception(f"Email error: {str(e)}")
