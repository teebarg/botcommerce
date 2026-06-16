import asyncio
from datetime import datetime, timedelta
from typing import Callable
import uuid

from prisma import Prisma, Json
from prisma.enums import CartStatus, OrderStatus, PaymentMethod, PaymentStatus

from app.core.config import settings
from app.core.logging import get_logger
from app.core.notifications.events import OrderConfirmedEvent
from app.core.notifications.service import NotificationService
from app.core.utils import generate_welcome_email
from app.services.cache import CacheService
from app.services.order import OrderService
from app.services.popular_products import PopularProductsService
from app.services.recently_viewed import RecentlyViewedService
from app.services.shop_settings import ShopSettingsService
from app.services.search import SearchService

logger = get_logger(__name__)


class RedisStreamConsumer:
    def __init__(
        self,
        stream: str,
        group: str,
        consumer: str,
        db_client: Prisma,
        service_factory: Callable[
            [Prisma],
            tuple[
                OrderService,
                SearchService,
                CacheService,
                ShopSettingsService,
                NotificationService,
            ],
        ],
    ):
        self.stream = stream
        self.group = group
        self.consumer = consumer
        self.db = db_client

        self.shutdown_event = asyncio.Event()
        self.consume_task = None

        self.get_services = service_factory

    async def start(self):
        """Start consumer with auto-restart supervision"""
        self.shutdown_event.clear()

        async def supervise(coro, name: str):
            """Run a task, restart on unexpected failure until shutdown."""
            while not self.shutdown_event.is_set():
                try:
                    logger.debug(f"Starting task: {name}")
                    await coro()
                except asyncio.CancelledError:
                    logger.error(f"Task cancelled: {name}")
                    raise
                except Exception as e:
                    logger.critical(
                        f"Task {name} crashed with error: {e}, restarting..."
                    )
                    await asyncio.sleep(1)
            logger.debug(f"Task stopped: {name}")

        self.consume_task = asyncio.create_task(
            supervise(self.consume, "redis-consume"),
            name="redis-consume-supervisor",
        )
        logger.debug("Redis consumer started with supervision...")

    async def stop(self):
        """Stop consumer loops gracefully"""
        self.shutdown_event.set()

        tasks = [t for t in [self.consume_task] if t]

        for task in tasks:
            logger.debug(f"Cancelling task: {task.get_name()}")
            task.cancel()

        if tasks:
            try:
                await asyncio.wait_for(
                    asyncio.gather(*tasks, return_exceptions=True),
                    timeout=5.0,
                )
            except asyncio.TimeoutError:
                logger.warning("Some consumer tasks didn’t stop gracefully")

        logger.debug("Redis consumer stopped.")

    async def consume(self):
        try:
            while not self.shutdown_event.is_set():
                try:
                    # 🚀 Resolve dependency stack EXACTLY ONCE per event-loop block cycle
                    services = self.get_services(self.db)
                    cache_srv = services[2]

                    events = await cache_srv.redis.xreadgroup(
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
                            await self._process(msg_id, data, services)

                except Exception as e:
                    logger.error(f"XREADGROUP error: {e}")
                    await asyncio.sleep(1)
        except Exception as e:
            logger.exception(f"Consumer error: {e}")
            await asyncio.sleep(1)

    async def claim_stale_messages(self):
        """Run occasionally to recover stuck messages."""
        try:
            services = self.get_services(self.db)
            cache_srv = services[2]

            claimed = await cache_srv.redis.xautoclaim(
                self.stream,
                self.group,
                self.consumer,
                50000,
                "0-0",
                count=10,
            )
            logger.debug(f"Claimed {len(claimed[1])} stale messages")
            for msg_id, data in claimed[1]:
                await self._process(msg_id, data, services)
        except Exception as e:
            logger.error(f"XAUTOCLAIM error: {e}")

    async def process_stream(self, msg_id: str, data: dict):
        services = self.get_services(self.db)
        await self._process(msg_id, data, services)

    async def _process(self, msg_id: str, data: dict, services: tuple):
        cache_srv = services[2]
        try:
            await self.handle_event(data, services)
            await cache_srv.redis.xack(self.stream, self.group, msg_id)
            await cache_srv.redis.xdel(self.stream, msg_id)
        except Exception as e:
            logger.error(f"Failed to process {msg_id}: {e}")

    async def handle_event(self, event: dict, services: tuple):
        event_type = event.get("type")
        if event_type == "ORDER_CREATED":
            await self.handle_order_created(event, services)
        elif event_type == "ORDER_PAID":
            await self.handle_order_paid(event, services)
        elif event_type == "PAYMENT_SUCCESS":
            await self.handle_payment_success(event, services)
        elif event_type == "RECENTLY_VIEWED":
            await self.handle_recently_viewed(event, services)
        elif event_type == "USER_REGISTERED":
            await self.handle_user_registered(event, services)

    async def handle_order_paid(self, event: dict, services: tuple):
        order_srv = services[0]
        try:
            await order_srv.process_order_payment(order_id=int(event["order_id"]))
        except Exception as e:
            logger.error(
                f"Failed to process order payment for order {event['order_id']}: {e}"
            )
            raise Exception(
                f"Failed to process order payment for order {event['order_id']}"
            )

    async def handle_order_created(self, event: dict, services: tuple):
        order_srv, search_srv, cache_srv, setting_srv, notification_srv = services
        try:
            await self.db.ordertimeline.create(
                data={
                    "order": {"connect": {"id": int(event["order_id"])}},
                    "message": f'order {event["order_number"]} created',
                    "from_status": OrderStatus.PENDING,
                    "to_status": OrderStatus.PENDING,
                }
            )
            await self.db.cart.update(
                where={"id": int(event["cart_id"])},
                data={
                    "status": CartStatus.CONVERTED,
                },
            )
            order_items = await self.db.orderitem.find_many(
                where={
                    "order_id": int(event["order_id"]),
                },
                include={
                    "variant": True,
                },
            )
            
            # Injecting resolved search container seamlessly
            service = PopularProductsService(search_srv=search_srv)
            for item in order_items:
                await service.track_product_interaction(
                    product_id=item.variant.product_id, interaction_type="purchase"
                )
        except Exception as e:
            logger.error(
                f"Failed to create order in handle_order_created: {str(e)}"
            )
            raise Exception(f"Database error: {str(e)}")

        await self.send_order_notification(
            id=int(event["order_id"]), user_id=int(event["user_id"]), services=services
        )
        await cache_srv.invalidate(tags=["users"])

    async def handle_payment_success(self, event: dict, services: tuple):
        try:
            await self.db.payment.create(
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
            logger.error(
                f"Failed to create order in handle_payment_success: {str(e)}"
            )
            raise Exception(f"Database error: {str(e)}")

    async def handle_recently_viewed(self, event: dict, services: tuple):
        order_srv, search_srv, cache_srv, setting_srv, notification_srv = services
        try:
            metadata = {
                "source": event.get("source", ""),
            }
            if int(event.get("time_spent", 0)) > 0:
                metadata["time_spent"] = int(event.get("time_spent", 0))

            key: str = f"user:{event['user_id']}:history"
            async with cache_srv.redis.pipeline(transaction=True) as pipe:
                pipe.lpush(key, event["product_id"])
                pipe.ltrim(key, 0, 49)
                pipe.expire(key, 60 * 60 * 24 * 30)
                await pipe.execute()

            await self.db.userinteraction.create(
                data={
                    "user": {"connect": {"id": int(event["user_id"])}},
                    "product": {"connect": {"id": int(event["product_id"])}},
                    "type": event["view_type"],
                    "metadata": Json(metadata),
                    "timestamp": datetime.now(),
                }
            )
        except Exception as e:
            logger.error(f"Failed to create user interaction: {str(e)}")
            raise Exception(f"Database error: {str(e)}")

        try:
            if event["view_type"] == "VIEW":
                recent_service = RecentlyViewedService(
                    cache=cache_srv, search_srv=search_srv
                )
                await recent_service.add_product(
                    user_id=int(event["user_id"]), product_id=int(event["product_id"])
                )

                await self.handle_track_popular(
                    product_id=int(event["product_id"]),
                    interaction_type="view",
                    services=services,
                )
            elif event["view_type"] == "CART_ADD":
                await self.handle_track_popular(
                    product_id=int(event["product_id"]),
                    interaction_type="add_to_cart",
                    services=services,
                )

        except Exception as e:
            logger.error(f"Failed to add product to recently viewed: {str(e)}")
            raise Exception(f"Redis error: {str(e)}")

    async def handle_track_popular(
        self, product_id: int, interaction_type: str, services: tuple
    ):
        search_srv = services[1]
        recent_service = PopularProductsService(search_srv=search_srv)
        await recent_service.track_product_interaction(
            product_id=product_id, interaction_type=interaction_type
        )

    async def handle_user_registered(self, event: dict, services: tuple) -> None:
        order_srv, search_srv, cache_srv, setting_srv, notification_srv = services
        try:
            code: str = (
                f"{event['first_name'][:4]}{uuid.uuid4().hex[:4]}".upper()
            )
            coupon = await self.db.coupon.create(
                data={
                    "code": code,
                    "discount_type": "PERCENTAGE",
                    "discount_value": 10,
                    "min_cart_value": 5000,
                    "max_uses": 1000,
                    "valid_from": datetime.now(),
                    "valid_until": datetime.now() + timedelta(weeks=500),
                    "users": {"connect": [{"id": int(event["id"])}]},
                }
            )

            await self.db.user.update(
                where={"id": int(event["id"])}, data={"referral_code": code}
            )
            welcome_email = await generate_welcome_email(
                email_to=event["email"],
                first_name=event["first_name"],
                coupon=coupon,
                shop_settings=setting_srv,
            )
            await notification_srv.send(
                channel_name="email",
                recipient=event["email"],
                subject=welcome_email.subject,
                message=welcome_email.html_content,
            )
            await cache_srv.invalidate(tags=["coupons", "users"])
        except Exception as e:
            logger.error(f"Failed to send welcome email: {str(e)}")
            raise Exception(f"Email error: {str(e)}")

    async def send_order_notification(self, id: int, user_id: int, services: tuple):
        order_srv, search_srv, cache_srv, setting_srv, notification_srv = services
        try:
            user = await self.db.user.find_unique(where={"id": user_id})
            if not user:
                logger.error(f"User not found for ID: {user_id}")
                return

            order = await self.db.order.find_unique(
                where={"id": id},
                include={
                    "order_items": {"include": {"variant": True}},
                    "user": True,
                    "shipping_address": True,
                },
            )

            shop_email = await setting_srv.get("shop_email")
            cc_list = [shop_email] if shop_email else []

            order_link: str = f"{settings.FRONTEND_HOST}/order/confirmed/{order.order_number}"
            items_overview: str = (
                "\n".join(
                    [
                        f"• {it.name} x{it.quantity} - {it.price}"
                        for it in (order.order_items or [])
                    ]
                )
                if order.order_items
                else "No items found"
            )

            await notification_srv.dispatch(
                OrderConfirmedEvent(
                    order=order,
                    user=user,
                    order_link=order_link,
                    items_overview=items_overview,
                    cc_list=cc_list,
                )
            )
        except Exception as e:
            logger.error(f"Failed to send notification: {e}")