from datetime import datetime, timedelta
import uuid
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from prisma.enums import CartStatus, OrderStatus
from app.prisma_client import prisma as db
from app.core.dependencies.services import SettingsDep
from app.core.logging import get_logger
from app.core.dependencies.cache import CacheDep
from app.core.dependencies.order import OrderDep
from app.core.security import verify_internal_signature
from app.core.notifications.setup import get_notification_service
from app.core.utils import generate_welcome_email

logger = get_logger(__name__)

router = APIRouter()

@router.post(
    "/orders/{order_number}/generate-invoice",
    include_in_schema=False,
    dependencies=[Depends(verify_internal_signature)],
)
async def internal_generate_invoice(order_number: str, order_srv: OrderDep, force: bool = False):
    order = await order_srv.db.order.find_unique(
        where={"order_number": order_number},
        include={"order_items": {"include": {"variant": True}}, "user": True},
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if not order.invoice_url:
        await order_srv.create_invoice(order.id, force=force)
        order = await order_srv.db.order.find_unique(
            where={"order_number": order_number},
            include={"order_items": {"include": {"variant": True}}, "user": True},
        )

    await order_srv.send_payment_receipt(order=order)

    return {"status": "ok", "invoice_url": order.invoice_url}


@router.post(
    "/orders/{order_id}/process-created",
    include_in_schema=False,
    dependencies=[Depends(verify_internal_signature)],
)
async def internal_order_creation(order_id: int, cache_srv: CacheDep, order_srv: OrderDep):
    order = await order_srv.db.order.find_unique(where={"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    try:
        async with db.tx() as tx:
            await tx.ordertimeline.upsert(
                where={"id": order.id, "from_status": OrderStatus.PENDING},
                data={
                    "create": {
                        "order": {"connect": {"id": order.id}},
                        "message": f'order {order.order_number} created',
                        "from_status": OrderStatus.PENDING,
                        "to_status": OrderStatus.PENDING,
                    },
                    "update": {
                    }
                }
            )
            await tx.cart.update(
                where={"id": order.cart_id},
                data={
                    "status": CartStatus.CONVERTED,
                },
            )
    except Exception as e:
        logger.error(f"[internal_order_creation]: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

    await cache_srv.invalidate(tags=["users"])
    await order_srv.send_order_notification(id=order.id)
    
    return {"status": "ok", "invoice_url": order.invoice_url}

@router.post(
    "/orders/{order_id}/process-referral",
    include_in_schema=False,
    dependencies=[Depends(verify_internal_signature)],
)
async def internal_process_referral(order_id: int, srv: OrderDep):
    order = await srv.db.order.find_unique(where={"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    await srv.process_referral(order=order)
    return {"status": "ok", "order_id": order_id}


@router.post(
    "/user/{user_id}/welcome",
    include_in_schema=False,
    dependencies=[Depends(verify_internal_signature)],
)
async def internal_user_signup(
    user_id: int,
    cache_srv: CacheDep,
    setting_srv: SettingsDep,
):
    user = await db.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.referral_code:
        logger.debug(f"User {user_id} already has referral code, skipping welcome pipeline")
        return {"status": "already_processed", "referral_code": user.referral_code}

    code: str = f"{user.first_name[:4]}{uuid.uuid4().hex[:4]}".upper()
    coupon = await db.coupon.create(
        data={
            "code": code,
            "discount_type": "PERCENTAGE",
            "discount_value": 10,
            "min_cart_value": 5000,
            "max_uses": 1000,
            "valid_from": datetime.now(),
            "valid_until": datetime.now() + timedelta(weeks=500),
            "users": {"connect": [{"id": user_id}]},
        }
    )

    await db.user.update(where={"id": user_id}, data={"referral_code": code})

    welcome_email = await generate_welcome_email(
        email_to=user.email,
        first_name=user.first_name,
        coupon=coupon,
        shop_settings=setting_srv,
    )
    notification_srv = get_notification_service()
    await notification_srv.send(
        channel_name="email",
        recipient=user.email,
        subject=welcome_email.subject,
        message=welcome_email.html_content,
    )
    await cache_srv.invalidate(tags=["coupons", "users"])

    return {"status": "ok", "referral_code": code}
