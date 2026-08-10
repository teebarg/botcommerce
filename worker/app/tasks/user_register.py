from datetime import datetime, timedelta
import uuid
from app.security import call_internal_backend
from core.logging import get_logger
from core.notifications import Channel, Welcome
from core.repositories.coupon_repository import CouponRepository
from core.repositories.user_repository import UserRepository
from app.db import session_factory

logger = get_logger(__name__)


async def user_register(ctx, user_id: int) -> dict:
    """
    arq job: delegates the welcome pipeline (coupon issuance + welcome email).
    """
    return await call_internal_backend(
        path=f"/internal/user/{user_id}/welcome",
        label=f"Welcome pipeline for user {user_id}",
    )


async def user_register(ctx, user_id: int):
    """
    arq job: delegates the welcome pipeline (coupon issuance + welcome email).
    """
    notification_srv = ctx["notification_srv"]

    async with session_factory() as session:
        user_repo = UserRepository(session)
        user = await user_repo.get(id)

        if not user:
            logger.error("User not found: %s", id)
            raise Exception("User not found")

        if user.referral_code:
            logger.debug("User %s already has referral code, skipping welcome pipeline", id)
            return {
                "status": "already_processed",
                "referral_code": user.referral_code,
            }

        try:
            code: str = f"{user.first_name[:4]}{uuid.uuid4().hex[:4]}".upper()
            coupon_repo = CouponRepository(session)
            coupon = await coupon_repo.create(
                data={
                    "code": code,
                    "discount_type": "PERCENTAGE",
                    "discount_value": 10,
                    "min_cart_value": 5000,
                    "max_uses": 1000,
                    "valid_from": datetime.now(),
                    "valid_until": datetime.now() + timedelta(weeks=500),
                    "user_id": user.id,
                }
            )

            await user_repo.update(id=id, data={"referral_code": code})
            await session.commit()
        except Exception:
            await session.rollback()
            logger.exception("Welcome job failed")
            raise

    await notification_srv.send(
        Welcome(
            email_to=user.email,
            first_name=user.first_name,
            coupon=coupon,
        ),
        channels=[Channel.EMAIL],
    )

    return {
        "status": "ok",
        "referral_code": code,
    }
