from datetime import datetime, timedelta
import uuid
from app.db import session_factory
from core.notifications import Channel, TestCreated, Welcome
from core.repositories.coupon_repository import CouponRepository
from core.repositories.user_repository import UserRepository
from core.logging import get_logger

logger = get_logger(__name__)

async def test_email(ctx):
    notification_srv = ctx["notification_srv"]
    await notification_srv.send(
        TestCreated(
            email="teebarg01@gmail.com",
        ),
        channels=[
            Channel.EMAIL,
            Channel.SLACK,
        ],
    )


async def test_welcome(ctx, id: int):
    notification_srv = ctx["notification_srv"]
    async with session_factory() as session:
        repo = UserRepository(session)
        user = await repo.get(id)

    if not user:
        logger.error(f"User not found: {str(id)}", exc_info=True)
        raise Exception("User not found")

    if user.referral_code:
        logger.debug(f"User {id} already has referral code, skipping welcome pipeline")
        return {"status": "already_processed", "referral_code": user.referral_code}

    async with session_factory() as session:
        try:
            code: str = f"{user.first_name[:4]}{uuid.uuid4().hex[:4]}".upper()
            repo = CouponRepository(session)
            coupon = await repo.create(data={
                "code": code,
                "discount_type": "PERCENTAGE",
                "discount_value": 10,
                "min_cart_value": 5000,
                "max_uses": 1000,
                "valid_from": datetime.now(),
                "valid_until": datetime.now() + timedelta(weeks=500),
                "user_id": user.id
            })
            user_repo = UserRepository(session)
            await user_repo.update(
                id=id,
                data={"referral_code": code},
            )
            await session.commit()
        except Exception:
            logger.exception("Welcome job failed")
            raise

    await notification_srv.send(
        Welcome(
            email_to="teebarg01@gmail.com",
            first_name="Shawn Watt",
            coupon=coupon
        ),
        channels=[
            Channel.EMAIL,
        ],
    )