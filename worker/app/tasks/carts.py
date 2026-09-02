from core.logging import get_logger
from core.notifications import Channel
from core.notifications.events import AbandonedCartEvent
from core.repositories.cart_repository import CartRepository

from app.db import session_factory

logger = get_logger(__name__)

async def process_abandoned_carts(ctx, cart_id: int) -> dict:
    """
    arq job: referral cashback processing.
    """
    notification_srv = ctx["notification_srv"]
    async with session_factory() as session:
        try:
            cart_repo = CartRepository(session)
            cart = await cart_repo.get_with_items(cart_id)
            if not cart:
                logger.error(f"cart with ID {cart_id} not found")
                return

            if not cart.user:
                logger.warning(f"cart {cart_id} has no associated user, skipping notification")
                return

            if not cart.email and not cart.user.email:
                logger.warning(f"cart {cart_id} has no email address, skipping notification")
                return

            cart_data = {
                "id": cart.id,
                "cart_number": cart.cart_number,
                "email": cart.email or cart.user.email,
                "total": cart.total,
                "subtotal": cart.subtotal,
                "tax": cart.tax,
                "shipping_fee": cart.shipping_fee,
                "cart_items": [
                    {
                        "name": item.name,
                        "quantity": item.quantity,
                        "price": item.variant.price,
                        "image": item.image,
                        "slug": item.slug
                    }
                    for item in cart.items
                ],
                "updated_at": cart.updated_at
            }
        except Exception as e:
            logger.error(f"An error occurred: {e}")
            raise e

    await notification_srv.send(
        AbandonedCartEvent(
            cart_data=cart_data,
            customer_email=cart.email or cart.user.email,
            user_name=cart.user.first_name or cart.user.username,
        ),
        channels=[Channel.EMAIL, Channel.SLACK],
    )
    return {"status": "ok"}
