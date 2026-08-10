from core.notifications import Channel, TestCreated, Welcome
from app.db import session_factory
from core.repositories.coupon_repository import CouponRepository

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


async def test_welcome(ctx):
    notification_srv = ctx["notification_srv"]
    async with session_factory() as session:
        repo = CouponRepository(session)
        coupon = await repo.get(id)

    await notification_srv.send(
        Welcome(
            email_to="teebarg01@gmail.com",
            shop_name="Upmund",
            first_name="Shawn Watt",
            coupon=coupon
        ),
        channels=[
            Channel.EMAIL,
        ],
    )