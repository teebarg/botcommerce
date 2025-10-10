import asyncio
import logging
from datetime import datetime, timedelta
from huey_instance import huey
from app.prisma_client import prisma as db
from app.core.utils import generate_abandoned_cart_email, send_email
from app.core.logging import get_logger
from prisma.enums import CartStatus

logger = get_logger(__name__)

async def send_abandoned_cart_reminder_task(cart_id: int):
    """Background task to send abandoned cart reminder email"""
    try:
        # Get cart with user and items
        cart = await db.cart.find_unique(
            where={"id": cart_id},
            include={
                "user": True,
                "items": {
                    "include": {
                        "variant": {
                            "include": {
                                "product": {
                                    "include": {"images": True}
                                }
                            }
                        }
                    }
                }
            }
        )
        
        if not cart:
            logger.error(f"Cart with ID {cart_id} not found")
            return
            
        if not cart.user:
            logger.warning(f"Cart {cart_id} has no associated user, skipping email")
            return
            
        if not cart.email and not cart.user.email:
            logger.warning(f"Cart {cart_id} has no email address, skipping email")
            return
            
        # Prepare cart data for email template
        cart_data = {
            "id": cart.id,
            "cart_number": cart.cart_number,
            "total": cart.total,
            "subtotal": cart.subtotal,
            "tax": cart.tax,
            "shipping_fee": cart.shipping_fee,
            "items": [
                {
                    "name": item.name,
                    "quantity": item.quantity,
                    "price": item.price,
                    "image": item.image,
                    "slug": item.slug
                }
                for item in cart.items
            ],
            "created_at": cart.created_at,
            "updated_at": cart.updated_at
        }
        
        # Generate and send email
        email_data = await generate_abandoned_cart_email(
            cart_data=cart_data,
            user_email=cart.email or cart.user.email,
            user_name=cart.user.first_name or cart.user.username
        )
        
        await send_email(
            email_to=cart.email or cart.user.email,
            subject=email_data.subject,
            html_content=email_data.html_content
        )
        
        logger.info(f"Abandoned cart reminder sent to {cart.email or cart.user.email} for cart {cart.cart_number}")
        
    except Exception as e:
        logger.error(f"Failed to send abandoned cart reminder for cart {cart_id}: {str(e)}")


@huey.task(retries=3, retry_delay=60)
def send_abandoned_cart_reminders_task(hours_threshold: int = 24, limit: int = 50):
    """Scheduled task to send abandoned cart reminders"""
    logger.info(f"Starting abandoned cart reminders task with {hours_threshold}h threshold")
    
    async def process_abandoned_carts():
        try:
            # Calculate the threshold time
            threshold_time = datetime.utcnow() - timedelta(hours=hours_threshold)
            
            # Find abandoned carts
            abandoned_carts = await db.cart.find_many(
                where={
                    "status": CartStatus.ACTIVE,
                    "updated_at": {"lt": threshold_time},
                    "user_id": {"not": None},  # Only carts with registered users
                    "OR": [
                        {"email": {"not": None}},  # Has email directly
                        {"user": {"email": {"not": None}}}  # User has email
                    ]
                },
                include={
                    "user": True,
                    "items": True
                },
                take=limit,
                order={"updated_at": "asc"}  # Oldest first
            )
            
            if not abandoned_carts:
                logger.info("No abandoned carts found")
                return
            
            # Send reminders for each abandoned cart
            for cart in abandoned_carts:
                await send_abandoned_cart_reminder_task(cart.id)
            
            logger.info(f"Processed {len(abandoned_carts)} abandoned cart reminders")
            
        except Exception as e:
            logger.error(f"Failed to process abandoned cart reminders: {str(e)}")
            raise
    
    asyncio.run(process_abandoned_carts())


@huey.periodic_task(cron='0 10 * * *')  # Run daily at 10 AM
def daily_abandoned_cart_reminders():
    """Daily task to send abandoned cart reminders"""
    logger.info("Running daily abandoned cart reminders")
    send_abandoned_cart_reminders_task(hours_threshold=24, limit=100)


@huey.periodic_task(cron='0 14 * * *')  # Run daily at 2 PM
def afternoon_abandoned_cart_reminders():
    """Afternoon task to send abandoned cart reminders for older carts"""
    logger.info("Running afternoon abandoned cart reminders")
    send_abandoned_cart_reminders_task(hours_threshold=48, limit=50)
