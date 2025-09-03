from app.prisma_client import prisma as db
from app.core.logging import get_logger
from app.core.deps import get_notification_service
from app.services.order import send_notification, decrement_variant_inventory_for_order, create_invoice
from prisma.enums import OrderStatus, PaymentStatus, PaymentMethod
from app.core.config import settings
from app.services.redis import CacheService
import redis.asyncio as redis
from app.services.recently_viewed import RecentlyViewedService
from prisma import Json
from datetime import datetime

logger = get_logger(__name__)

async def handle_event(event):
    if event["type"] == "ORDER_CREATED":
        await handle_order_created(event)
    elif event["type"] == "ORDER_PAID":
        await handle_order_paid(event)
    elif event["type"] == "ORDER_STATUS":
        await handle_order_status(event)
    elif event["type"] == "PAYMENT_SUCCESS":
        await handle_payment_success(event)
    elif event["type"] == "PAYMENT_FAILED":
        await handle_payment_failed(event)
    elif event["type"] == "RECENTLY_VIEWED":
        await handle_recently_viewed(event)


def get_notification():
    notification = get_notification_service()
    return notification


def get_cache():
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    cache = CacheService(redis_client)
    return cache


async def handle_order_paid(event):
    try:
        await create_invoice(order_id=int(event["order_id"]), cache=get_cache())
        await decrement_variant_inventory_for_order(cache=get_cache(), order_id=int(event["order_id"]), notification=get_notification())
    except Exception as e:
        logger.error(f"Failed to create invoice or decrement variant inventory for order {event['order_id']}: {e}")
        raise Exception(f"Failed to create invoice or decrement variant inventory for order {event['order_id']}")


async def handle_order_created(event):
    try:
        await db.ordertimeline.create(
            data={
                "order": {"connect": {"id": int(event["order_id"])}},
                "message": f'Order {event["order_number"]} created',
                "from_status": OrderStatus.PENDING,
                "to_status": OrderStatus.PENDING,
            }
        )
    except Exception as e:
        logger.error(f"Failed to create order: {str(e)}")
        raise Exception(f"Database error: {str(e)}")

    await send_notification(id=int(event["order_id"]), user_id=int(event["user_id"]), notification=get_notification())


async def handle_payment_success(event):
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

async def handle_recently_viewed(event):
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
        product = await db.product.find_unique(
            where={"id": int(event["product_id"])},
            include={"variants": True, "images": True}
        )
        if not product:
            raise Exception("Product not found")

        product_data = {
            "id": product.id,
            "name": product.name or "",
            "slug": product.slug or "",
            "image": (product.images[0].image if product.images else ""),
            "price": min(variant.price for variant in product.variants) if product.variants else 0,
            "old_price": min(variant.old_price for variant in product.variants) if product.variants else 0,
            "rating": product.ratings or 4.5,
            "variant_id": product.variants[0].id if len(product.variants) > 0 else None,
        }
        service = RecentlyViewedService(cache=get_cache())
        await service.add_product(user_id=int(event["user_id"]), product_data=product_data)
    except Exception as e:
        logger.error(f"Failed to add product to recently viewed in redis: {str(e)}")
        raise Exception(f"Redis error: {str(e)}")

